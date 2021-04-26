package com.github.aaronanderson.etlu.xrserver;

import java.io.IOException;
import java.io.StringReader;
import java.io.UncheckedIOException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.nio.file.StandardWatchEventKinds;
import java.nio.file.WatchEvent;
import java.nio.file.WatchKey;
import java.nio.file.WatchService;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.stream.Stream;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonPatchBuilder;
import javax.json.JsonValue;
import javax.json.JsonWriter;
import javax.json.JsonWriterFactory;
import javax.json.stream.JsonGenerator;

import org.jboss.logging.Logger;

import com.github.aaronanderson.etlu.runtime.modules.ModuleManager;
import com.github.aaronanderson.etlu.runtime.spi.ModuleInstance;
import com.github.aaronanderson.etlu.runtime.spi.ModuleInstance.WebArchive;

import io.netty.handler.codec.http.HttpHeaderNames;
import io.quarkus.runtime.LaunchMode;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.impl.MimeMapping;
import io.vertx.ext.web.Router;

@ApplicationScoped
public class WebServer {

	private static final Logger LOG = Logger.getLogger(WebServer.class);

	@Inject
	ModuleManager moduleManager;

	@Inject
	LaunchMode mode;

	public void init(@Observes Router router) {
		LOG.info("Quarkus Mode: " + mode);
		Set<String> boundPaths = new HashSet<>();
		try {
			router.get("/").handler(rc -> rc.reroute("/index.html"));
			boundPaths.add("/");
			router.get("/etlu-modules.js").handler(rc -> rc.response()
					.putHeader(HttpHeaderNames.CONTENT_TYPE, "text/javascript").end(moduleManager.getModuleJS()));
			boundPaths.add("/etlu-modules.js");

			WebArchive xrArchive = ModuleInstance.loadWebArchive(WebServer.class.getClassLoader(), "xr-server");
			registerWebArchive(router, xrArchive, boundPaths);
			for (ModuleInstance<?> moduleInstance : moduleManager.getModules()) {
				if (moduleInstance.getFileSystem() != null) {
					registerWebArchive(router, new WebArchive(moduleInstance.getPath(), moduleInstance.getFileSystem()),
							boundPaths);
				}
			}
		} catch (Exception e) {
			LOG.error("", e);
		}
		if (LaunchMode.DEVELOPMENT == mode) {
			try {
				Path basePath = Paths.get(System.getProperty("user.dir")).getParent().toAbsolutePath();
				Path devPath = basePath.resolve("target/dev-server");
				Files.createDirectories(devPath);
				Path modulesPath = basePath.resolve("../modules").normalize().toAbsolutePath();
				Path xrSrcPath = basePath.resolve("src/main/web").normalize().toAbsolutePath();

				// Merge and update the NPM json files
				JsonWriterFactory writerFactory = Json.createWriterFactory(Map.of(JsonGenerator.PRETTY_PRINTING, true));
				JsonPatchBuilder patchBuilder = Json.createPatchBuilder();

				JsonObject tsConfigJson = Json.createReader(Files.newBufferedReader(basePath.resolve("tsconfig.json")))
						.readObject();
				tsConfigJson = patchBuilder.replace("/compilerOptions/outDir", "build").replace("/include/0", "src")
						.build().apply(tsConfigJson);

				try (JsonWriter jsonWriter = writerFactory
						.createWriter(Files.newBufferedWriter(devPath.resolve("tsconfig.json"),
								StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING));) {
					jsonWriter.writeObject(tsConfigJson);
				}

				String snowpackJS = Files.readString(basePath.resolve("snowpack.config.js"));
				int snowpackJSStart = snowpackJS.indexOf("=");
				int snowpackJSEnd = snowpackJS.lastIndexOf(";");
				
				JsonObject snowPackJson = Json.createReader(new StringReader(snowpackJS.substring(snowpackJSStart + 1, snowpackJSEnd)))
						.readObject();
				snowPackJson = patchBuilder.remove("/mount/src~1main~1web").add("/mount/src", "/")
						.replace("/buildOptions/out", "./build").build().apply(snowPackJson);

				Files.writeString(devPath.resolve("snowpack.config.js"), String.format("%s = %s;", snowpackJS.substring(0, snowpackJSStart), snowPackJson),
						StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);	

				Files.copy(basePath.resolve("lit-scss-plugin.js"), devPath.resolve("lit-scss-plugin.js"),
						StandardCopyOption.REPLACE_EXISTING);

				JsonObject packageJson = Json.createReader(Files.newBufferedReader(basePath.resolve("package.json")))
						.readObject();
				JsonPatchBuilder dependencyPatchBuilder = patchBuilder;
				Set<String> dependencies = new HashSet<>();
				for (String dependency : packageJson.getJsonObject("dependencies").keySet()) {
					dependencies.add(dependency);
				}

				// Copy over the module source files
				LOG.infof("Starting dev mode synchronization of web files to %s", devPath.toAbsolutePath());
				Map<Path, Path> syncPaths = new HashMap<>();
				Path targetServerPath = devPath.resolve("src");
				Files.createDirectories(targetServerPath);
				copyDirectory(xrSrcPath, targetServerPath);
				syncPaths.put(xrSrcPath, targetServerPath);
				for (ModuleInstance<?> moduleInstance : moduleManager.getModules()) {
					if (moduleInstance.getFileSystem() != null) {
						String moduleId = moduleInstance.getPath();
						Path modulePath = modulesPath.resolve(moduleId);
						if (Files.exists(modulePath)) {
							Path targetModulePath = targetServerPath.resolve(moduleId);
							Files.createDirectories(targetModulePath);
							Path sourceModulePath = modulePath.resolve("src/main/web");
							copyDirectory(sourceModulePath, targetModulePath);
							syncPaths.put(sourceModulePath, targetModulePath);

							JsonObject modulePackageJson = Json
									.createReader(Files.newBufferedReader(modulePath.resolve("package.json")))
									.readObject();
							for (Entry<String, JsonValue> dependency : modulePackageJson.getJsonObject("dependencies")
									.entrySet()) {
								if (!dependencies.contains(dependency.getKey())) {
									dependencyPatchBuilder = dependencyPatchBuilder.add(
											"/dependencies/" + dependency.getKey().replaceAll("/", "~1"),
											dependency.getValue());
									dependencies.add(dependency.getKey());
								}
							}

						} else {
							LOG.errorf("Module path %s does not exist, skipping sync", modulePath);
						}

					}
				}

				// write the updated package dependencies and module import files
				packageJson = dependencyPatchBuilder.build().apply(packageJson);
				try (JsonWriter jsonWriter = writerFactory
						.createWriter(Files.newBufferedWriter(devPath.resolve("package.json"),
								StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING));) {
					jsonWriter.writeObject(packageJson);

				}
				Files.writeString(targetServerPath.resolve("etlu-modules.js"), moduleManager.getModuleJS());

				// sync source files with the dev server source files.
				syncDirectories(syncPaths);
			} catch (IOException e) {
				LOG.error("", e);
			}
		}

	}

//	public void shutdown(@Observes ShutdownEvent shutdownEvent) {
//	}

	private void registerWebArchive(Router router, WebArchive archive, Set<String> boundPaths) throws IOException {
		try (final Stream<Path> walk = Files.walk(archive.getFileSystem().getPath("/"))) {
			walk.forEach(path -> {
				String urlPath = path.toString();
				if (!(Files.isDirectory(path) || urlPath.endsWith("package.json") || boundPaths.contains(urlPath))) {
					LOG.infof("Adding route %s from archive path %s", urlPath, archive.getWebArchiveId());
					boundPaths.add(urlPath);
					router.get(urlPath).handler(rc -> {
						String contentType = MimeMapping.getMimeTypeForFilename(path.getFileName().toString());
						if (contentType != null) {
							rc.response().putHeader(HttpHeaderNames.CONTENT_TYPE, contentType);
						}
						try {
							rc.response().end(Buffer.buffer(Files.readAllBytes(path)));
						} catch (IOException e) {
							throw new UncheckedIOException(e);
						}
					});
				}
			});
		}

	}

	public static void copyDirectory(Path source, Path target) throws IOException {

		Files.walk(source).forEach(sourcePath -> {
			try {
				Path targetPath = target.resolve(source.relativize(sourcePath));
				if (Files.isDirectory(sourcePath)) {
					if (!Files.exists(targetPath))
						Files.createDirectory(targetPath);
					return;
				}
				Files.copy(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
			} catch (IOException e) {
				throw new UncheckedIOException(e);
			}
		});

	}

	private void syncDirectories(Map<Path, Path> syncPaths) throws IOException {
		Runnable task = () -> {
			Map<WatchKey, Path[]> watchKeyPaths = new HashMap<>();
			try (final WatchService watchService = FileSystems.getDefault().newWatchService()) {
				for (Map.Entry<Path, Path> syncPath : syncPaths.entrySet()) {
					Files.walk(syncPath.getKey()).filter(Files::isDirectory).forEach((p) -> {
						try {
							Path[] watchEntry = new Path[2];
							watchEntry[0] = p;
							WatchKey watchKey;
							Path relativeSyncPath = syncPath.getKey().relativize(p);
							watchEntry[1] = syncPath.getValue().resolve(relativeSyncPath);
							watchKey = p.register(watchService, StandardWatchEventKinds.ENTRY_CREATE,
									StandardWatchEventKinds.ENTRY_MODIFY, StandardWatchEventKinds.ENTRY_DELETE);
							watchKeyPaths.put(watchKey, watchEntry);
						} catch (IOException e) {
							LOG.error("", e);
						}
					});
				}

				while (true) {
					final WatchKey wk = watchService.take();
					Path[] watchEntry = watchKeyPaths.get(wk);
					Path baseSourcePath = watchEntry[0];
					Path baseTargetPath = watchEntry[1];
					for (WatchEvent<?> event : wk.pollEvents()) {
						try {
							// we only register "ENTRY_MODIFY" so the context is always a Path.
							final Path sourcePath = baseSourcePath.resolve((Path) event.context());
							final Path targetPath = baseTargetPath.resolve((Path) event.context());

							if (event.kind() == StandardWatchEventKinds.ENTRY_CREATE) {
								if (Files.isDirectory(sourcePath)) {
									Files.createDirectory(targetPath);
									LOG.infof("Added directory %s", targetPath.toAbsolutePath());
								} else {
									Files.copy(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
									LOG.infof("Added file %s", targetPath.toAbsolutePath());
								}
							} else if (event.kind() == StandardWatchEventKinds.ENTRY_MODIFY) {
								if (Files.isDirectory(sourcePath)) {
									LOG.infof("Directory modfiy skipped %s", targetPath.toAbsolutePath());
								} else {
									Files.copy(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
									LOG.infof("Modified file %s", targetPath.toAbsolutePath());
								}
							} else if (event.kind() == StandardWatchEventKinds.ENTRY_DELETE) {
								if (Files.isDirectory(targetPath)) {
									Files.deleteIfExists(targetPath);
									LOG.infof("Deleted directory %s", targetPath.toAbsolutePath());
								} else {
									Files.deleteIfExists(targetPath);
									LOG.infof("Deleted file %s", targetPath.toAbsolutePath());
								}
							}
						} catch (NoSuchFileException e) {
							// ignore, it may be a temp file being deleted
						}
					}
					// reset the key
					boolean valid = wk.reset();
					if (!valid) {
						LOG.warnf("watch key has been unregistered %s", wk.watchable());
					}
				}
			} catch (InterruptedException ie) {
				LOG.warn("", ie);
			} catch (IOException e) {
				LOG.error("", e);
			}

		};
		Thread thread = new Thread(task, "ETLU Dev Server File Sync");
		thread.setDaemon(true);
		thread.start();

	}

}
