package com.github.aaronanderson.etlu.xrserver;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.inject.Inject;

import org.jboss.logging.Logger;

import com.github.aaronanderson.etlu.runtime.modules.ModuleManager;

import io.quarkus.runtime.LaunchMode;
import io.quarkus.runtime.StartupEvent;

@ApplicationScoped
public class DevModuleSync {

	@Inject
	ModuleManager moduleManager;

	private static final Logger LOG = Logger.getLogger(DevModuleSync.class);

	@Inject
	LaunchMode mode;

	void onStart(@Observes StartupEvent ev) {
		LOG.info("Quarkus Mode: " + mode);
		if (LaunchMode.DEVELOPMENT == mode) {
			LOG.info("Module JS: " + moduleManager.generateModuleJS());
		}

	}

	@PostConstruct
	public void init() {

	}

}
