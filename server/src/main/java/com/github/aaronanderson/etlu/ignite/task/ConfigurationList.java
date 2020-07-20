package com.github.aaronanderson.etlu.ignite.task;

import java.io.ByteArrayInputStream;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import javax.cache.Cache;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;

import org.apache.ignite.Ignite;
import org.apache.ignite.IgniteCache;
import org.apache.ignite.IgniteLogger;
import org.apache.ignite.binary.BinaryObject;
import org.apache.ignite.cache.query.QueryCursor;
import org.apache.ignite.cache.query.ScanQuery;
import org.apache.ignite.lang.IgniteCallable;
import org.apache.ignite.resources.IgniteInstanceResource;
import org.apache.ignite.resources.LoggerResource;

public class ConfigurationList implements IgniteCallable<JsonArray> {
	private static final long serialVersionUID = 1L;

	@LoggerResource
	private IgniteLogger log;

	@IgniteInstanceResource
	private Ignite ignite;

	@Override
	public JsonArray call() throws Exception {
		IgniteCache<UUID, BinaryObject> cache = ignite.cache("configuration").withKeepBinary();
		// cache.invoke(id, new CacheEntryProcessor<Long, BinaryObject, Object>() { ...
		JsonArrayBuilder response = Json.createArrayBuilder();
		try (QueryCursor<Cache.Entry<UUID, BinaryObject>> cursor = cache.query(new ScanQuery())) {
			for (Cache.Entry<UUID, BinaryObject> e : cursor) {
				BinaryObject cEntry = e.getValue();
				log.info("Cache Entry" + cEntry.toString());
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
		// return Json.createObjectBuilder().add("status", "ok").add("entries",
		// response.build()).build();
	}

}
