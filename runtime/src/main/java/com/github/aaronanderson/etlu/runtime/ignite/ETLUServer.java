package com.github.aaronanderson.etlu.runtime.ignite;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.enterprise.event.Event;
import javax.enterprise.inject.Produces;
import javax.inject.Inject;

import org.apache.ignite.Ignite;
import org.apache.ignite.IgniteCluster;
import org.apache.ignite.IgniteException;
import org.apache.ignite.IgniteSystemProperties;
import org.apache.ignite.Ignition;
import org.apache.ignite.cluster.ClusterNode;
import org.apache.ignite.configuration.ConnectorConfiguration;
import org.apache.ignite.configuration.DataStorageConfiguration;
import org.apache.ignite.configuration.IgniteConfiguration;
import org.apache.ignite.lifecycle.LifecycleBean;
import org.apache.ignite.lifecycle.LifecycleEventType;
import org.apache.ignite.resources.IgniteInstanceResource;
import org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi;
import org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi;
import org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder;

import com.github.aaronanderson.etlu.runtime.spi.StartEvent;
import com.github.aaronanderson.etlu.runtime.spi.StopEvent;

public class ETLUServer implements LifecycleBean {

	public static final String ETLU_HOME = "ETLU_HOME";

	public static final String DEFAULT_HOST = "127.0.0.1";
	public static final int DEFAULT_PORT_RANGE = 20;
	public static final int DEFAULT_DISCOVERY_PORT = 48500;
	public static final int DEFAULT_COM_PORT = 48100;
	public static final int DEFAULT_CONNECTOR_PORT = 13211;

	@IgniteInstanceResource
	protected Ignite ignite;

	@Inject
	Event<IgniteConfiguration> configurationEvent;

	@Inject
	Event<StartEvent> startEvent;

	@Inject
	Event<StopEvent> stopEvent;

	protected void start(String homePath, String instanceName) {

		IgniteConfiguration igniteConfig = new IgniteConfiguration();
		igniteConfig.setClientMode(false);

		System.setProperty(IgniteSystemProperties.IGNITE_QUIET, "true");
		System.setProperty(IgniteSystemProperties.IGNITE_NO_ASCII, "true");
		System.setProperty(IgniteSystemProperties.IGNITE_PERFORMANCE_SUGGESTIONS_DISABLED, "true");
		// -Djava.util.logging.manager=org.apache.logging.log4j.jul.LogManager should be
		// set as a JVM option to ensure OWB logging is handled by log4j2

		Path home = Paths.get(homePath);

		Map<String, Object> attrs = new HashMap<>();
		attrs.put(ETLU_HOME, home.toString());

		// Persistence
		DataStorageConfiguration storageCfg = new DataStorageConfiguration();
		storageCfg.getDefaultDataRegionConfiguration().setPersistenceEnabled(true);
		storageCfg.setStoragePath(home.resolve("db").toString());
		storageCfg.setWalPath(home.resolve(DataStorageConfiguration.DFLT_WAL_PATH).toString());
		storageCfg.setWalArchivePath(home.resolve(DataStorageConfiguration.DFLT_WAL_ARCHIVE_PATH).toString());

		igniteConfig.setDataStorageConfiguration(storageCfg);

		// Discovery
		TcpCommunicationSpi commSpi = new TcpCommunicationSpi();
		igniteConfig.setCommunicationSpi(commSpi);
		TcpDiscoverySpi discoverySpi = new TcpDiscoverySpi();
		igniteConfig.setDiscoverySpi(discoverySpi);
		TcpDiscoveryVmIpFinder ipFinder = new TcpDiscoveryVmIpFinder();
		discoverySpi.setIpFinder(ipFinder);
		ConnectorConfiguration conConfig = new ConnectorConfiguration();
		igniteConfig.setConnectorConfiguration(conConfig);

		discoverySpi.setLocalAddress(DEFAULT_HOST);
		discoverySpi.setLocalPort(DEFAULT_DISCOVERY_PORT);
		discoverySpi.setLocalPortRange(DEFAULT_PORT_RANGE);
		ipFinder.setAddresses(Stream
				.of(DEFAULT_HOST + ":" + DEFAULT_DISCOVERY_PORT + ".." + (DEFAULT_DISCOVERY_PORT + DEFAULT_PORT_RANGE))
				.collect(Collectors.toList()));
		commSpi.setLocalPort(DEFAULT_COM_PORT);
		commSpi.setLocalPortRange(DEFAULT_PORT_RANGE);
		conConfig.setHost(DEFAULT_HOST);
		conConfig.setPort(DEFAULT_CONNECTOR_PORT);
		conConfig.setPortRange(DEFAULT_PORT_RANGE);

		// Applying settings.
		// igniteConfig.setPluginConfigurations(pluginCfgs);
		// Enable peer class loading for now until REST task script deployment
		// available. Client classes will be sent to server.
		igniteConfig.setPeerClassLoadingEnabled(true);
		igniteConfig.setActiveOnStart(true).setAutoActivationEnabled(true)
				// .setGridLogger(log)
				.setUserAttributes(attrs).setWorkDirectory(home.resolve("work").toAbsolutePath().toString());

		igniteConfig.setIgniteInstanceName(instanceName);

		// Tenant service is automatically enabled on all nodes
		// CacheConfiguration tenantCacheCfg = new CacheConfiguration("Tenant");
		// tenantCacheCfg.setCacheMode(CacheMode.REPLICATED);

		//
		igniteConfig.setLifecycleBeans(this);

		configure(igniteConfig);

		configurationEvent.fire(igniteConfig);

		Ignition.start(igniteConfig);
		IgniteCluster igniteCluster = ignite.cluster();
		igniteCluster.active(true);
		igniteCluster.setBaselineTopology(1l);
		Collection<ClusterNode> nodes = ignite.cluster().forServers().nodes();
		ignite.cluster().setBaselineTopology(nodes);

		startEvent.fire(new StartEvent(ignite));
	}

	protected void configure(IgniteConfiguration igniteConfig) {
	}

	@Override
	public void onLifecycleEvent(LifecycleEventType evt) throws IgniteException {
		if (evt == LifecycleEventType.BEFORE_NODE_START) {

		} else if (evt == LifecycleEventType.BEFORE_NODE_STOP) {

		}

	}

	protected void stop() {
		stopEvent.fire(new StopEvent(ignite));
		if (ignite != null) {
			ignite.close();
		}
		ignite = null;
	}

}
