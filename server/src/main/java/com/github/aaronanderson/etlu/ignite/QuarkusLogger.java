package com.github.aaronanderson.etlu.ignite;

import static org.apache.ignite.IgniteSystemProperties.IGNITE_QUIET;

import java.util.UUID;

import org.apache.ignite.IgniteLogger;
import org.apache.ignite.internal.util.tostring.GridToStringExclude;
import org.apache.ignite.logger.LoggerNodeIdAware;
import org.apache.ignite.logger.log4j2.Log4J2Logger;
import org.apache.logging.log4j.LogManager;
import org.jboss.logging.Logger;
import org.jetbrains.annotations.Nullable;

public class QuarkusLogger implements IgniteLogger, LoggerNodeIdAware {

	private static final Logger LOG = Logger.getLogger("ETLUIgnite");

	@GridToStringExclude
	private volatile UUID nodeId;

	private final Logger log;

	QuarkusLogger(Logger log) {
		this.log = log;
	}

	QuarkusLogger() {
		this.log = LOG;
	}

	@Override
	public void setNodeId(UUID nodeId) {
		this.nodeId = nodeId;

	}

	@Override
	public UUID getNodeId() {
		return this.nodeId;
	}

	@Override
	public IgniteLogger getLogger(Object ctgr) {
		if (ctgr == null) {
			return new QuarkusLogger(LOG);
		}
		if (ctgr instanceof Class) {
			return new QuarkusLogger(Logger.getLogger(((Class<?>) ctgr).getName()));
		}
		return new QuarkusLogger(Logger.getLogger(ctgr.toString()));
	}

	@Override
	public void trace(String msg) {
		log.trace(msg);

	}

	@Override
	public void debug(String msg) {
		log.debug(msg);

	}

	@Override
	public void info(String msg) {
		log.info(msg);

	}

	@Override
	public void warning(String msg, @Nullable Throwable e) {
		log.warn(msg, e);

	}

	@Override
	public void error(String msg, @Nullable Throwable e) {
		log.error(msg, e);

	}

	@Override
	public boolean isTraceEnabled() {
		return log.isTraceEnabled();
	}

	@Override
	public boolean isDebugEnabled() {
		return log.isDebugEnabled();
	}

	@Override
	public boolean isInfoEnabled() {
		return log.isInfoEnabled();
	}

	@Override
	public boolean isQuiet() {
		return Boolean.valueOf(System.getProperty(IGNITE_QUIET, "true"));
	}

	@Override
	public String fileName() {
		return null;
	}

}
