package com.github.aaronanderson.etlu.runtime.modules;

import java.util.logging.Logger;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Any;
import javax.enterprise.inject.Instance;
import javax.inject.Inject;

import com.github.aaronanderson.etlu.runtime.spi.ETLUModule;
import com.github.aaronanderson.etlu.runtime.spi.ETLUModule.ModuleInfo;

@ApplicationScoped
public class ModuleManager {

	private static final Logger LOG = Logger.getLogger(ModuleManager.class.getName());

	@Inject
	@Any
	Instance<ETLUModule> modules;

	@PostConstruct
	public void init() {
		for (ETLUModule m : modules) {
			ModuleInfo info = m.getClass().getAnnotation(ModuleInfo.class);
			if (info != null) {
				LOG.info(String.format("Processing module %s", info.name()));
			} else {
				LOG.severe(String.format("Module %s does not have required ModuleInfo annotation", m.getClass()));
			}
		}

	}

	public String generateModuleJS() {
		return "import test";
	}
}
