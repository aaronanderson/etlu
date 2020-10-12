package com.github.aaronanderson.etlu.runtime.spi;

import org.apache.ignite.Ignite;

public class StartEvent {

	private final Ignite ignite;

	public StartEvent(Ignite ignite) {
		this.ignite = ignite;
	}

	public Ignite ignite() {
		return ignite;
	}

}
