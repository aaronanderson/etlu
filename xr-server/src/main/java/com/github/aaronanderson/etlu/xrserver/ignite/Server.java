package com.github.aaronanderson.etlu.xrserver.ignite;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.enterprise.inject.Produces;

import org.apache.ignite.Ignite;
import org.apache.ignite.configuration.IgniteConfiguration;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import com.github.aaronanderson.etlu.runtime.ignite.ETLUServer;

import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;

@ApplicationScoped
public class Server extends ETLUServer {

	@ConfigProperty(name = "etlu.homePath", defaultValue = "etlu")
	String homePath;

	@ConfigProperty(name = "etlu.instanceName", defaultValue = "etlu")
	String instanceName;

	void onStart(@Observes StartupEvent ev) {
		start(homePath, instanceName);
	}

	protected void configure(IgniteConfiguration igniteConfig) {
		Logger.getLogger("ETLUIgnite").info("HOME: " + igniteConfig.getUserAttributes().get(ETLU_HOME));
		igniteConfig.setGridLogger(new QuarkusLogger());
	}

	void onStop(@Observes ShutdownEvent ev) {
		stop();
	}

}
