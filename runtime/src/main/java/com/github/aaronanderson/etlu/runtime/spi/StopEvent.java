package com.github.aaronanderson.etlu.runtime.spi;

import org.apache.ignite.Ignite;

public class StopEvent {

	private final Ignite ignite;

	public StopEvent(Ignite ignite) {
		this.ignite = ignite;
	}

	public Ignite ignite() {
		return ignite;
	}
}
