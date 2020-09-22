package com.github.aaronanderson.etlu.runtime.ignite.task;

import org.apache.ignite.Ignite;
import org.apache.ignite.IgniteLogger;
import org.apache.ignite.lang.IgniteCallable;
import org.apache.ignite.resources.IgniteInstanceResource;
import org.apache.ignite.resources.LoggerResource;

public class ConfigurationDelete implements IgniteCallable<Void> {
	private static final long serialVersionUID = 1L;

	@LoggerResource
	private IgniteLogger log;

	@IgniteInstanceResource
	private Ignite ignite;

	@Override
	public Void call() throws Exception {
		log.info("Deleting Configuration");
		String cacheName = "configuration";
		ignite.destroyCache(cacheName);

		log.info("Destroyed Configuration");
		return null;
		// return Json.createObjectBuilder().add("status", "OK").add("message",
		// "Configuration Deleted").build();
	}

}
