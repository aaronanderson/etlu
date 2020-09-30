package com.github.aaronanderson.etlu.runtime.modules;

import java.nio.file.NoSuchFileException;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.annotation.Priority;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Any;
import javax.enterprise.inject.Instance;
import javax.inject.Inject;

import com.github.aaronanderson.etlu.runtime.spi.ETLUModule;
import com.github.aaronanderson.etlu.runtime.spi.ETLUModule.ModuleInfo;
import com.github.aaronanderson.etlu.runtime.spi.ModuleInstance;
import com.github.aaronanderson.etlu.runtime.spi.ModuleInstance.WebArchive;

@ApplicationScoped
public class ModuleManager {

	private static final Logger LOG = Logger.getLogger(ModuleManager.class.getName());

	@Inject
	@Any
	Instance<ETLUModule> modules;

	final private List<ModuleInstance<?>> moduleInstances = new LinkedList<>();

	private String moduleJS;

	@PostConstruct
	public void init() {
		StringBuilder moduleJSFile = new StringBuilder();
		for (ETLUModule m : modules) {
			ModuleInfo info = m.getClass().getAnnotation(ModuleInfo.class);
			if (info != null) {
				LOG.info(String.format("Processing module %s", info.name()));
			} else {
				LOG.severe(String.format("Module %s does not have required ModuleInfo annotation", m.getClass()));
			}
			ModuleInstance<?> moduleInstance = new ModuleInstance(info.name(), info.path(), m);
			Priority priorityInfo = m.getClass().getAnnotation(Priority.class);
			if (priorityInfo != null) {
				moduleInstance.setPriority(priorityInfo.value());
			}
			try {
				WebArchive webArchive = ModuleInstance.loadWebArchive(m.getClass().getClassLoader(),
						moduleInstance.getPath());
				if (webArchive != null) {
					moduleInstance.setFileSystem(webArchive.getFileSystem());
					moduleJSFile.append(String.format("import '/%s/index.js'\n", info.path()));
				}
			} catch (Exception e) {
				LOG.log(Level.SEVERE, "", e);
			}
			moduleInstances.add(moduleInstance);
		}
		Collections.sort(moduleInstances);
		this.moduleJS = moduleJSFile.toString();

	}

//	Runtime.getRuntime().addShutdownHook(new Thread() {
//		  public void run() {
//		    Path path = ...;
//
//		    Files.delete(path);
//		  }
//		});
//	
	@PreDestroy
	public void destroy() {
		for (ModuleInstance<?> moduleInstance : moduleInstances) {
			if (moduleInstance.getFileSystem() != null) {
				try {
					moduleInstance.getFileSystem().close();
				} catch (NoSuchFileException e) {
					
				} catch (Exception e) {
					LOG.log(Level.SEVERE, "", e);

				}
			}
		}
	}

	public List<ModuleInstance<?>> getModules() {
		return moduleInstances;
	}

	public String getModuleJS() {
		return this.moduleJS;
	}

}
