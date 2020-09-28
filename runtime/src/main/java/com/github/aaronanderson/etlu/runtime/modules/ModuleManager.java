package com.github.aaronanderson.etlu.runtime.modules;

import java.util.LinkedList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Any;
import javax.enterprise.inject.Instance;
import javax.inject.Inject;

import com.github.aaronanderson.etlu.runtime.spi.ETLUModule;
import com.github.aaronanderson.etlu.runtime.spi.WebArchive;
import com.github.aaronanderson.etlu.runtime.spi.ETLUModule.ModuleInfo;

@ApplicationScoped
public class ModuleManager {

	private static final Logger LOG = Logger.getLogger(ModuleManager.class.getName());

	@Inject
	@Any
	Instance<ETLUModule> modules;

	final private List<WebArchive> webArchives = new LinkedList<>();

	@PostConstruct
	public void init() {
		for (ETLUModule m : modules) {
			ModuleInfo info = m.getClass().getAnnotation(ModuleInfo.class);
			if (info != null) {
				LOG.info(String.format("Processing module %s", info.name()));
			} else {
				LOG.severe(String.format("Module %s does not have required ModuleInfo annotation", m.getClass()));
			}
			try {
				WebArchive webArchive = WebArchive.loadWebArchive(m.getClass().getClassLoader(), info.path());
				if (webArchive != null) {
					webArchives.add(webArchive);
				}
			} catch (Exception e) {
				LOG.log(Level.SEVERE, "", e);
			}

		}
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
		for (WebArchive webArchive : webArchives) {
			try {
				webArchive.getFileSystem().close();
			} catch (Exception e) {
				LOG.log(Level.SEVERE, "", e);
			}
		}
	}

	public List<WebArchive> getWebArchives() {
		return webArchives;
	}

	public String generateModuleJS() {
		return "import test";
	}

}
