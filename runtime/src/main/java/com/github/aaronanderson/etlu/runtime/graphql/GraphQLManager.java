package com.github.aaronanderson.etlu.runtime.graphql;

import java.io.InputStreamReader;
import java.util.Map;
import java.util.UUID;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;

import graphql.GraphQL;
import graphql.language.StringValue;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import graphql.schema.DataFetcher;
import graphql.schema.GraphQLScalarType;
import graphql.schema.GraphQLSchema;
import graphql.schema.TypeResolver;
import graphql.schema.idl.FieldWiringEnvironment;
import graphql.schema.idl.RuntimeWiring;
import graphql.schema.idl.RuntimeWiring.Builder;
import graphql.schema.idl.SchemaGenerator;
import graphql.schema.idl.SchemaParser;
import graphql.schema.idl.TypeDefinitionRegistry;
import graphql.schema.idl.WiringFactory;

@ApplicationScoped
public class GraphQLManager {

	private GraphQL graphQL;

	// TODO switch to ignite cache as source
	private JsonArrayBuilder projects = Json.createArrayBuilder();

	@PostConstruct
	public void init() {
		projects.add(Json.createObjectBuilder().add("name", "ETLU Test").add("id", newID()));
		configure();

	}

	@PreDestroy
	public void destroy() {
		projects = null;
	}

	@Produces
	public GraphQL graphQL() {
		return graphQL;
	}

	private static String newID() {
		return UUID.randomUUID().toString().replaceAll("-", "");
	}

	public void configure() {
		TypeDefinitionRegistry typeRegistry = new TypeDefinitionRegistry();
		SchemaParser schemaParser = new SchemaParser();
		// TODO allow graphql plugin injectiion. Tricky, because GraphQL is also
		// produced. Perhaps try Optional?
		TypeDefinitionRegistry typeDefinitionRegistry = schemaParser.parse(new InputStreamReader(
				Thread.currentThread().getContextClassLoader().getResourceAsStream("META-INF/etlu-app.graphql")));
		typeRegistry.merge(typeDefinitionRegistry);

		Builder runtimeWiringBuilder = RuntimeWiring.newRuntimeWiring();

		runtimeWiringBuilder.wiringFactory(new WiringFactory() {

			@Override
			public DataFetcher getDefaultDataFetcher(FieldWiringEnvironment environment) {

				return new JSONPropertyDataFetcher(environment.getFieldDefinition().getName());

			}
		});

		runtimeWiringBuilder.type("Query", typeWiring -> typeWiring.dataFetcher("projects", projects()));

		runtimeWiringBuilder.type("Mutation", typeWiring -> typeWiring.dataFetcher("createProject", createProject()));

		runtimeWiringBuilder.type("File", typeWiring -> typeWiring.typeResolver(fileType()));

		runtimeWiringBuilder.scalar(DATE);
		runtimeWiringBuilder.scalar(DATETIME);

		RuntimeWiring runtimeWiring = runtimeWiringBuilder.build();

		SchemaGenerator schemaGenerator = new SchemaGenerator();
		GraphQLSchema graphQLSchema = schemaGenerator.makeExecutableSchema(typeRegistry, runtimeWiring);

		graphQL = GraphQL.newGraphQL(graphQLSchema).build();
	}

	private DataFetcher<JsonObject> projects() {
		return (e) -> {
			return Json.createObjectBuilder().add("projects", projects).add("nextToken", "AAAAAA").build();
		};
	}

	private DataFetcher<JsonObject> createProject() {
		return (e) -> {
			// Only maps are allowed for inputs
			// https://stackoverflow.com/questions/54257346/graphql-use-input-type-to-search-data
			Map<String, Object> input = e.getArgument("input");
			return Json.createObjectBuilder().add("name", (String) input.get("name")).build();

		};
	}

	private TypeResolver fileType() {
		return (e) -> {
			return e.getSchema().getObjectType("ProjectsFile");
		};
	}

	public static final GraphQLScalarType DATE = GraphQLScalarType.newScalar().name("Date")
			.coercing(new Coercing<String, String>() {
				@Override
				public String serialize(Object dataFetcherResult) {
					if (dataFetcherResult instanceof String) {
						return (String) dataFetcherResult;
					}
					throw new CoercingSerializeException("Unable to serialize " + dataFetcherResult + " as a date");

				}

				@Override
				public String parseValue(Object input) {
					if (input instanceof String) {
						try {
							return (String) input;
						} catch (Exception e) {
							throw new CoercingParseValueException(e);
						}
					}
					throw new CoercingParseValueException("Unable to parse variable value " + input + " as a date");
				}

				@Override
				public String parseLiteral(Object input) {
					if (input instanceof StringValue) {
						return ((StringValue) input).getValue();
					}
					throw new CoercingParseLiteralException("Value is not a date : '" + String.valueOf(input) + "'");
				}
			}).build();

	public static final GraphQLScalarType DATETIME = GraphQLScalarType.newScalar().name("DateTime")
			.coercing(new Coercing<String, String>() {
				@Override
				public String serialize(Object dataFetcherResult) {
					if (dataFetcherResult instanceof String) {
						return (String) dataFetcherResult;
					}
					throw new CoercingSerializeException("Unable to serialize " + dataFetcherResult + " as a datetime");

				}

				@Override
				public String parseValue(Object input) {
					if (input instanceof String) {
						try {
							return (String) input;
						} catch (Exception e) {
							throw new CoercingParseValueException(e);
						}
					}
					throw new CoercingParseValueException("Unable to parse variable value " + input + " as a datetime");
				}

				@Override
				public String parseLiteral(Object input) {
					if (input instanceof StringValue) {
						return ((StringValue) input).getValue();
					}
					throw new CoercingParseLiteralException(
							"Value is not a datetime : '" + String.valueOf(input) + "'");
				}
			}).build();
}
