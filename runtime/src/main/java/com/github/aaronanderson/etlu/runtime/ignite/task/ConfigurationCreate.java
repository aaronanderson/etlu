package com.github.aaronanderson.etlu.runtime.ignite.task;

import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.UUID;

import javax.json.Json;

import org.apache.ignite.Ignite;
import org.apache.ignite.IgniteCache;
import org.apache.ignite.IgniteLogger;
import org.apache.ignite.binary.BinaryObject;
import org.apache.ignite.binary.BinaryObjectBuilder;
import org.apache.ignite.cache.QueryEntity;
import org.apache.ignite.cache.QueryIndex;
import org.apache.ignite.configuration.CacheConfiguration;
import org.apache.ignite.lang.IgniteCallable;
import org.apache.ignite.resources.IgniteInstanceResource;
import org.apache.ignite.resources.LoggerResource;

public class ConfigurationCreate implements IgniteCallable<Void> {
    private static final long serialVersionUID = 1L;

    @LoggerResource
    private IgniteLogger log;

    @IgniteInstanceResource
    private Ignite ignite;

    @Override
    public Void call() throws Exception {
        log.info("Creating Configuration");
        String cacheName = "configuration";
        CacheConfiguration cacheCfg = new CacheConfiguration<>(cacheName);
        //cacheCfg.setAtomicityMode(CacheAtomicityMode.TRANSACTIONAL);

        // Creating the query entity. 
        QueryEntity entry = new QueryEntity(UUID.class.getName(), "ConfigurationEntry");
        entry.setTableName(cacheName.toUpperCase());

        entry.setKeyType(UUID.class.getName());
        entry.setKeyFieldName("tsid");


        // Listing all the queryable fields.
        LinkedHashMap<String, String> fields = new LinkedHashMap<>();
        fields.put("tsid", UUID.class.getName());
        fields.put("key", String.class.getName());
        fields.put("path", String.class.getName());

        fields.put("modifiedTime", ZonedDateTime.class.getName());
        fields.put("json", byte[].class.getName());

        entry.setFields(fields);

        Collection<QueryIndex> indexes = new ArrayList<>(6);

        indexes.add(new QueryIndex("path"));

        entry.setIndexes(indexes);

        cacheCfg.setQueryEntities(Collections.singletonList(entry));

        IgniteCache<UUID, BinaryObject> configCache = ignite.createCache(cacheCfg);

        BinaryObjectBuilder repositories = ignite.binary().builder("ConfigurationEntry");
        //repositories.setField("tsid", UUID.randomUUID());
        repositories.setField("key", "projects");
        repositories.setField("path", "/projects");
        repositories.setField("modifiedTime", ZonedDateTime.now(ZoneId.systemDefault()));
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        Json.createWriter(bos).write(Json.createObjectBuilder().build());
        repositories.setField("json", bos.toByteArray());
        configCache.put(UUID.randomUUID(), repositories.build());

        log.info("Created Configuration");
        return null;
        //return Json.createObjectBuilder().add("status", "OK").add("message", "Configuration Created").build();
    }

}