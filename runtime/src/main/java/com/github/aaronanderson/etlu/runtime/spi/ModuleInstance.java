package com.github.aaronanderson.etlu.runtime.spi;

import java.io.IOException;
import java.io.InputStream;
import java.lang.annotation.Annotation;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;

public class ModuleInstance<M> implements Comparable<ModuleInstance<?>> {
	private final String id;
	private final String path;
	private final M module;

	private int priority = 100;
	private Path archivePath;
	private FileSystem fileSystem;

	public ModuleInstance(String id, String path, M module) {
		this.id = id;
		this.path = path;
		this.module = module;
	}

	public String getId() {
		return id;
	}

	public String getPath() {
		return path;
	}

	public M getModule() {
		return module;
	}

	public int getPriority() {
		return priority;
	}

	public void setPriority(int priority) {
		this.priority = priority;
	}

	public Path getArchivePath() {
		return archivePath;
	}

	public void setFileSystem(FileSystem fileSystem) {
		this.fileSystem = fileSystem;
	}

	public FileSystem getFileSystem() {
		return fileSystem;
	}

	public static class WebArchive {
		private final String webArchiveId;
		private final FileSystem fileSystem;

		public WebArchive(String webArchiveId, FileSystem fileSystem) {
			this.webArchiveId = webArchiveId;
			this.fileSystem = fileSystem;
		}

		public String getWebArchiveId() {
			return webArchiveId;
		}

		public FileSystem getFileSystem() {
			return fileSystem;
		}

	}

	public static WebArchive loadWebArchive(ClassLoader classLoader, String webArchiveId)
			throws URISyntaxException, IOException {
		URL webResourceURL = classLoader.getResource(String.format("web-%s.zip", webArchiveId));
		if (webResourceURL != null) {
			// Path tempWebZip = Files.createTempFile("etlu-web-" + info.path(), ".zip");
			// Files.copy(webResources, tempWebZip, StandardCopyOption.REPLACE_EXISTING);
			URI webZipURI = webResourceURL.toURI();
			String webZipURIStr = webZipURI.toString();
			if (webZipURIStr.contains("!")) {
				String[] uriParts = webZipURIStr.split("!");
				uriParts[0] = uriParts[0].replace("jar:file:", "");
				try (FileSystem jarFS = FileSystems.newFileSystem(Paths.get(uriParts[0].trim()))) {
					final Path webZipPath = jarFS.getPath(uriParts[1].trim());
					return new WebArchive(webArchiveId, FileSystems.newFileSystem(webZipPath));
				}
			} else {
				// final URI tempWebZipURI = URI.create("jar:" + webResourceURL.toURI());
				final Path webZipPath = Paths.get(webZipURI);
				return new WebArchive(webArchiveId, FileSystems.newFileSystem(webZipPath));

			}
		}
		return null;
	}

	@Override
	public int compareTo(ModuleInstance<?> o) {
		int result = Integer.compare(this.getPriority(), o.getPriority());
		if (result == 0) {
			result = this.getPath().compareTo(o.getPath());
		}
		return result;
	}
}
