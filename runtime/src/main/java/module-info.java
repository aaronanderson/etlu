module com.github.aaronanderson.etlu.runtime { 
	requires transitive ignite.core;
	requires transitive java.json;
	requires transitive cache.api;
	requires transitive jakarta.enterprise.cdi.api;
	requires transitive java.annotation;
	requires transitive graphql.java;
	
	exports com.github.aaronanderson.etlu.runtime.spi;
}