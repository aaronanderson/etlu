
open module com.github.aaronanderson.etlu.runtime {
	requires transitive ignite.core;
	requires transitive java.json;
	requires transitive cache.api;
	requires transitive jakarta.enterprise.cdi.api;
	requires transitive jakarta.inject.api;
	requires transitive java.annotation;
	requires transitive graphql.java;
	requires transitive org.apache.avro;
	requires transitive org.apache.avro.compiler;
	requires java.logging;

	exports com.github.aaronanderson.etlu.runtime.spi;
}