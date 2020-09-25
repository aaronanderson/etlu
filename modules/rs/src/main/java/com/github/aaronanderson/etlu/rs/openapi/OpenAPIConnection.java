package com.github.aaronanderson.etlu.rs.openapi;

import java.net.URL;
import java.util.Map.Entry;

import org.openapi4j.parser.OpenApi3Parser;
import org.openapi4j.parser.model.v3.OpenApi3;
import org.openapi4j.parser.model.v3.Operation;
import org.openapi4j.parser.model.v3.Path;

public class OpenAPIConnection {

	public static void main(String[] args) {
		try {
			OpenApi3 api = new OpenApi3Parser().parse(new URL(
					"https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/api-with-examples.json"),
					false);
			for (Entry<String, Path> path : api.getPaths().entrySet()) {
				System.out.format("Path %s\n", path.getKey());
				for (Entry<String, Operation> op : path.getValue().getOperations().entrySet()) {
					System.out.format("Operation %s %s\n", op.getKey(), op.getValue().getOperationId());
				}
			}
			// JsonNode node = api.toNode();
			// String out = api.toString(EnumSet.of(SerializationFlag.OUT_AS_JSON));
			// System.out.format("JSON: %s\n", out); //node.asText());
		} catch (Exception e) {
			e.printStackTrace();
		}

	}
}