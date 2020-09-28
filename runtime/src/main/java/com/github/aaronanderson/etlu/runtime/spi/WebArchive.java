package com.github.aaronanderson.etlu.runtime.spi;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.util.Collections;

public class WebArchive {
	private final String id;
	private final Path archivePath;
	private final FileSystem fileSystem;

	public WebArchive(String id, Path archivePath, FileSystem fileSystem) {
		this.id = id;
		this.archivePath = archivePath;
		this.fileSystem = fileSystem;
	}

	public String getId() {
		return id;
	}

	public Path getArchivePath() {
		return archivePath;
	}

	public FileSystem getFileSystem() {
		return fileSystem;
	}

	public static WebArchive loadWebArchive(ClassLoader classLoader, String id) throws URISyntaxException, IOException {

		URL webResourceURL = classLoader.getResource(String.format("/web-%s.zip", id));
		if (webResourceURL != null) {
			// Path tempWebZip = Files.createTempFile("etlu-web-" + info.path(), ".zip");
			// Files.copy(webResources, tempWebZip, StandardCopyOption.REPLACE_EXISTING);
			final URI tempWebZipURI = URI.create("jar:" + webResourceURL.toURI());
			FileSystem fs = FileSystems.newFileSystem(tempWebZipURI, Collections.singletonMap("create", true));
			return new WebArchive(id, null, fs);
//			System.out.format("Created fs for %s\n", info.name());
//			try (final FileSystem fs = FileSystems.newFileSystem(tempWebZipURI,
			// Collections.singletonMap("create", true));) {
//				final Path entry = fs.getPath(ENTRY);
//				final BasicFileAttributes attrs = Files.readAttributes(entry, BasicFileAttributes.class);
//				System.out.println(attrs.creationTime());
//			}
		}
		return null;// new WebArchive(id, archivePath, fileSystem);
	}
}
