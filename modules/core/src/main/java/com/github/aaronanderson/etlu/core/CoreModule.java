package com.github.aaronanderson.etlu.core;

import java.io.ByteArrayInputStream;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Logger;

import javax.annotation.PostConstruct;
import javax.annotation.Priority;
import javax.cache.Cache;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Event;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericRecord;
import org.apache.ignite.Ignite;
import org.apache.ignite.IgniteCache;
import org.apache.ignite.binary.BinaryObject;
import org.apache.ignite.binary.BinaryObjectBuilder;
import org.apache.ignite.cache.CacheAtomicityMode;
import org.apache.ignite.cache.CacheMode;
import org.apache.ignite.cache.CacheRebalanceMode;
import org.apache.ignite.cache.QueryEntity;
import org.apache.ignite.cache.QueryIndex;
import org.apache.ignite.cache.query.QueryCursor;
import org.apache.ignite.cache.query.ScanQuery;
import org.apache.ignite.configuration.CacheConfiguration;

import com.github.aaronanderson.etlu.core.spi.Project;
import com.github.aaronanderson.etlu.runtime.spi.AvroIDL;
import com.github.aaronanderson.etlu.runtime.spi.AvroSchema;
import com.github.aaronanderson.etlu.runtime.spi.ETLUModule;
import com.github.aaronanderson.etlu.runtime.spi.ETLUModule.ModuleInfo;
import com.github.aaronanderson.etlu.runtime.spi.GraphQLSchema;
import com.github.aaronanderson.etlu.runtime.spi.GraphQLWire;
import com.github.aaronanderson.etlu.runtime.spi.StartEvent;

import graphql.schema.DataFetcher;
import graphql.schema.TypeResolver;
import graphql.schema.idl.RuntimeWiring.Builder;

@ModuleInfo(name = "Core", path = "core")
@Priority(10)
@GraphQLSchema("/META-INF/core.graphql")
@AvroIDL("/META-INF/core.avdl")
@ApplicationScoped
public class CoreModule implements ETLUModule {

	private static final Logger LOG = Logger.getLogger(CoreModule.class.getName());

	// TODO switch to ignite cache as source
	// private JsonArrayBuilder projects = Json.createArrayBuilder();

	Ignite ignite;

	@Inject
	@AvroSchema(name = "Project", namespace = "etlu.core")
	Schema projectSchema;

	@Inject
	@Project
	Event<CacheConfiguration> cacheConfigEvent;

	public void start(@Observes StartEvent startEvent) {
		this.ignite = startEvent.ignite();
		if (!ignite.cacheNames().contains("configuration")) {
			createConfiguration();
		}
	}

	// @GraphQLWire

	public void graphQLWire(@Observes @GraphQLWire Builder runtimeWiringBuilder) {
		runtimeWiringBuilder.type("Query", typeWiring -> typeWiring.dataFetcher("projects", projects()));
		runtimeWiringBuilder.type("Mutation", typeWiring -> typeWiring.dataFetcher("createProject", createProject()));
		runtimeWiringBuilder.type("File", typeWiring -> typeWiring.typeResolver(fileType()));
	}

	private DataFetcher<JsonObject> projects() {
		JsonArrayBuilder projects = Json.createArrayBuilder();

		return (e) -> {
			return Json.createObjectBuilder().add("projects", projects).add("nextToken", "AAAAAA").build();
		};
	}

	private DataFetcher<JsonObject> createProject() {
		return (e) -> {
			// Only maps are allowed for inputs
			// https://stackoverflow.com/questions/54257346/graphql-use-input-type-to-search-data
			Map<String, Object> input = e.getArgument("input");
			String projectName = (String) input.get("name");
			GenericRecord projectRecord = new GenericData.Record(projectSchema);
			createProject(projectRecord);
			return Json.createObjectBuilder().add("name", projectName).build();

		};
	}

	private void createConfiguration() {
		LOG.info("Creating Configuration");
		String cacheName = "configuration";
		CacheConfiguration cacheCfg = new CacheConfiguration<>(cacheName);
		// cacheCfg.setAtomicityMode(CacheAtomicityMode.TRANSACTIONAL);

		// Creating the query entity.
		QueryEntity entry = new QueryEntity(UUID.class.getName(), "ConfigurationEntry");
		entry.setTableName(cacheName.toUpperCase());

		// entry.setKeyType(UUID.class.getName());
		// entry.setKeyFieldName("tsid");

		// Listing all the queryable fields.
		LinkedHashMap<String, String> efields = new LinkedHashMap<>();
		efields.put("uid", UUID.class.getName());
		efields.put("type", String.class.getName());
		efields.put("key", String.class.getName());
		efields.put("path", String.class.getName());
		efields.put("createdTime", Date.class.getName());
		efields.put("modifiedTime", Date.class.getName());
		efields.put("metadata", byte[].class.getName());
		efields.put("value", byte[].class.getName());
		entry.setFields(efields);

		Set<String> ekfields = new HashSet<>();
		ekfields.add("path");
		entry.setKeyFields(ekfields);

		Collection<QueryIndex> eindexes = new ArrayList<>(1);
		eindexes.add(new QueryIndex("uid"));
		eindexes.add(new QueryIndex("type"));
		entry.setIndexes(eindexes);

		cacheCfg.setQueryEntities(Collections.singletonList(entry));

		IgniteCache<UUID, BinaryObject> configCache = ignite.createCache(cacheCfg);

		BinaryObjectBuilder projects = ignite.binary().builder("ConfigurationEntry");
		projects.setField("uid", UUID.randomUUID());
		projects.setField("type", "projects");
		projects.setField("key", "projects");
		projects.setField("path", "/projects");
		projects.setField("createdTime", ZonedDateTime.now(ZoneId.systemDefault()));
		projects.setField("modifiedTime", ZonedDateTime.now(ZoneId.systemDefault()));
		configCache.put(UUID.randomUUID(), projects.build());

		LOG.info("Created Configuration");

	}

	private void configurationDelete() {
		LOG.info("Deleting Configuration");
		String cacheName = "configuration";
		ignite.destroyCache(cacheName);

		LOG.info("Destroyed Configuration");
	}

	private JsonArray configurationList() {
		IgniteCache<UUID, BinaryObject> cache = ignite.cache("configuration").withKeepBinary();
		// cache.invoke(id, new CacheEntryProcessor<Long, BinaryObject, Object>() { ...
		JsonArrayBuilder response = Json.createArrayBuilder();
		try (QueryCursor<Cache.Entry<UUID, BinaryObject>> cursor = cache.query(new ScanQuery())) {
			for (Cache.Entry<UUID, BinaryObject> e : cursor) {
				BinaryObject cEntry = e.getValue();
				LOG.info("Cache Entry" + cEntry.toString());
				JsonObjectBuilder entry = Json.createObjectBuilder();
				entry.add("key", cEntry.<String>field("key"));
				entry.add("path", cEntry.<String>field("path"));
				entry.add("modifiedTime",
						cEntry.<ZonedDateTime>field("modifiedTime").format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
				entry.add("json", Json.createParser(new ByteArrayInputStream(cEntry.field("json"))).getValue());
				response.add(entry);
			}
		}

		return response.build();
	}

	private void createProject(GenericRecord project) {
		LOG.info("Creating Project");

		String projectId = (String) project.get("id");
		CacheConfiguration projecttCacheCfg = new CacheConfiguration("project/" + projectId);
		// tenantCacheCfg.setSqlSchema("ETLU");
		projecttCacheCfg.setCacheMode(CacheMode.REPLICATED);
		projecttCacheCfg.setRebalanceMode(CacheRebalanceMode.SYNC);
		projecttCacheCfg.setSqlIndexMaxInlineSize(120);
		List<QueryEntity> entities = new LinkedList<>();
		entities.add(createProjectConfiguration());
		projecttCacheCfg.setQueryEntities(entities);
		projecttCacheCfg.setAtomicityMode(CacheAtomicityMode.TRANSACTIONAL);
		cacheConfigEvent.fire(projecttCacheCfg);
		IgniteCache<BinaryObject, BinaryObject> projectCache = ignite.createCache(projecttCacheCfg).withKeepBinary();

		BinaryObjectBuilder modulesKey = ignite.binary().builder("ConfigurationKey");
		modulesKey.setField("path", "/etlu:modules");
		BinaryObjectBuilder modules = ignite.binary().builder("Configuration");
		modules.setField("uid", UUID.randomUUID());
		modules.setField("type", "etlu:project");
		modules.setField("modifiedTime", ZonedDateTime.now(ZoneId.systemDefault()));
		projectCache.put(modulesKey.build(), modules.build());

		LOG.info("Created Project Cache and Configuration");
	}

	private QueryEntity createProjectConfiguration() {
		QueryEntity entity = new QueryEntity("ConfigurationKey", "Configuration");
		entity.setTableName("CONFIGURATION");

		LinkedHashMap<String, String> efields = new LinkedHashMap<>();
		efields.put("uid", UUID.class.getName());
		efields.put("type", String.class.getName());
		efields.put("path", String.class.getName());
		efields.put("createdTime", Date.class.getName());
		efields.put("modifiedTime", Date.class.getName());
		efields.put("metadata", byte[].class.getName());
		efields.put("value", byte[].class.getName());

		entity.setFields(efields);

		Set<String> ekfields = new HashSet<>();
		ekfields.add("path");
		entity.setKeyFields(ekfields);

		Collection<QueryIndex> eindexes = new ArrayList<>(1);
		eindexes.add(new QueryIndex("uid"));
		eindexes.add(new QueryIndex("type"));

		entity.setIndexes(eindexes);

		return entity;
	}

	private TypeResolver fileType() {
		return (e) -> {
			return e.getSchema().getObjectType("ProjectsFile");
		};
	}

}
