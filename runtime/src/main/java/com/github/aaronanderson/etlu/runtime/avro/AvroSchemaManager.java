package com.github.aaronanderson.etlu.runtime.avro;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;
import javax.enterprise.inject.spi.Annotated;
import javax.enterprise.inject.spi.InjectionPoint;
import javax.inject.Inject;

import org.apache.avro.Protocol;
import org.apache.avro.Schema;
import org.apache.avro.compiler.idl.Idl;
import org.apache.avro.compiler.idl.ParseException;

import com.github.aaronanderson.etlu.runtime.modules.ModuleManager;
import com.github.aaronanderson.etlu.runtime.spi.AvroIDL;
import com.github.aaronanderson.etlu.runtime.spi.AvroSchema;
import com.github.aaronanderson.etlu.runtime.spi.ModuleInstance;

@ApplicationScoped
public class AvroSchemaManager {

	private static final Logger LOG = Logger.getLogger(AvroSchemaManager.class.getName());

	@Inject
	ModuleManager moduleManager;

	private Map<SchemaKey, Schema> avroSchemas = new HashMap<>();

	@PostConstruct
	public void init() {
		Map<SchemaKey, List<Schema>> avroSchemaLists = new HashMap<>();
		List<File> idlFiles = new LinkedList<>();
		Path tempIDLDirectory = null;
		try {
			tempIDLDirectory = Files.createTempDirectory("etlu-avro-idl");
			for (ModuleInstance<?> module : moduleManager.getModules()) {
				AvroIDL avroIDL = module.getModule().getClass().getAnnotation(AvroIDL.class);
				if (avroIDL != null) {
					InputStream is = module.getClass().getResourceAsStream(avroIDL.value());
					if (is != null) {
						// tempIDLDirectory.resolve(module.getPath());
						Files.createDirectories(tempIDLDirectory);
						Path idlFileName = Paths.get(avroIDL.value()).getFileName();
						Path idlPath = tempIDLDirectory.resolve(idlFileName);
						Files.copy(is, idlPath, StandardCopyOption.REPLACE_EXISTING);
						idlFiles.add(idlPath.toFile());

					} else {
						LOG.log(Level.SEVERE, String.format("Module %s Avro IDL path %s is unavailable",
								module.getPath(), avroIDL.value()));
					}
				}
			}
			for (File idlFile : idlFiles) {
				try (Idl parser = new Idl(idlFile);) {
					Protocol protocol = parser.CompilationUnit();
					Collection<Schema> schemas = protocol.getTypes();
					for (Schema schema : schemas) {
						SchemaKey schemaKey = new SchemaKey(schema.getName(), schema.getNamespace());
						List<Schema> keySchemas = avroSchemaLists.computeIfAbsent(schemaKey, k -> new LinkedList<>());
						keySchemas.add(schema);
					}
				} catch (ParseException | IOException e) {
					LOG.log(Level.SEVERE, String.format("Module Avro IDL parse error: %s", idlFile), e);
				}
			}
		} catch (IOException e) {
			LOG.log(Level.SEVERE, "problem processing IDL file.", e);
		} finally {
			try {
				Files.walk(tempIDLDirectory).sorted(Comparator.reverseOrder()).map(Path::toFile).forEach(File::delete);
			} catch (IOException e) {
			}
		}
		for (Map.Entry<SchemaKey, List<Schema>> entry : avroSchemaLists.entrySet()) {
			avroSchemas.put(entry.getKey(), entry.getValue().get(0));
		}

	}

	@Produces
	@AvroSchema
	public Schema getSchema(InjectionPoint ip) {
		Annotated annotated = ip.getAnnotated();
		AvroSchema avroSchema = annotated.getAnnotation(AvroSchema.class);
		return avroSchemas.get(new SchemaKey(avroSchema.name(), avroSchema.namespace()));
	}

	private static class SchemaKey {
		private final String name;
		private final String namespace;

		public SchemaKey(String name, String namespace) {
			this.name = name;
			this.namespace = namespace;
		}

		public String getName() {
			return name;
		}

		public String getNamespace() {
			return namespace;
		}

		@Override
		public int hashCode() {
			final int prime = 31;
			int result = 1;
			result = prime * result + ((name == null) ? 0 : name.hashCode());
			result = prime * result + ((namespace == null) ? 0 : namespace.hashCode());
			return result;
		}

		@Override
		public boolean equals(Object obj) {
			if (this == obj)
				return true;
			if (obj == null)
				return false;
			if (getClass() != obj.getClass())
				return false;
			SchemaKey other = (SchemaKey) obj;
			if (name == null) {
				if (other.name != null)
					return false;
			} else if (!name.equals(other.name))
				return false;
			if (namespace == null) {
				if (other.namespace != null)
					return false;
			} else if (!namespace.equals(other.namespace))
				return false;
			return true;
		}

	}

}
