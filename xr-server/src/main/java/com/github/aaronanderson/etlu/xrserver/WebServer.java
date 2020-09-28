package com.github.aaronanderson.etlu.xrserver;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.inject.Inject;

import org.jboss.logging.Logger;

import com.github.aaronanderson.etlu.runtime.modules.ModuleManager;
import com.github.aaronanderson.etlu.runtime.spi.WebArchive;

import io.quarkus.runtime.LaunchMode;
import io.vertx.core.buffer.Buffer;
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
		if (LaunchMode.DEVELOPMENT == mode) {
			LOG.info("Module JS: " + moduleManager.generateModuleJS());
		}
		try {
			router.get("/").handler(rc -> rc.reroute("/index.html"));

			WebArchive xrArchive = WebArchive.loadWebArchive(Thread.currentThread().getContextClassLoader(),
					"xr-server");
			registerWebArchive(router, xrArchive);
			for (WebArchive archive : moduleManager.getWebArchives()) {
				registerWebArchive(router, archive);
			}
		} catch (Exception e) {
			LOG.error("", e);
		}

	}

	private void registerWebArchive(Router router, WebArchive archive) throws IOException {
		try (final Stream<Path> walk = Files.walk(archive.getFileSystem().getPath("/"))) {
			walk.forEach(path -> {
				String urlPath = path.toString();
				if (!(Files.isDirectory(path) || urlPath.endsWith("package.json"))) {
					LOG.info(String.format("Adding route %s", urlPath));
					router.get(urlPath).handler(rc -> {
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

}
