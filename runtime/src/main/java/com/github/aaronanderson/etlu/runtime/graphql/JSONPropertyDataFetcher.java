package com.github.aaronanderson.etlu.runtime.graphql;

import javax.json.JsonObject;

import graphql.schema.DataFetchingEnvironment;
import graphql.schema.PropertyDataFetcher;

public class JSONPropertyDataFetcher extends PropertyDataFetcher {

	public JSONPropertyDataFetcher(String propertyName) {
		super(propertyName);
	}

	@Override
	public Object get(DataFetchingEnvironment environment) {
		Object source = environment.getSource();
		if (source instanceof JsonObject) {
			JsonObject jsonObject = (JsonObject) source;
			return jsonObject.get(getPropertyName());
		}
		return super.get(environment);
	}
}