package com.github.aaronanderson.etlu.runtime.graphql;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Event;
import javax.enterprise.inject.Produces;
import javax.inject.Inject;

import com.github.aaronanderson.etlu.runtime.modules.ModuleManager;
import com.github.aaronanderson.etlu.runtime.spi.GraphQLWire;
import com.github.aaronanderson.etlu.runtime.spi.ModuleInstance;

import graphql.GraphQL;
import graphql.language.StringValue;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import graphql.schema.DataFetcher;
import graphql.schema.GraphQLScalarType;
import graphql.schema.GraphQLSchema;
import graphql.schema.idl.FieldWiringEnvironment;
import graphql.schema.idl.RuntimeWiring;
import graphql.schema.idl.RuntimeWiring.Builder;
import graphql.schema.idl.SchemaGenerator;
import graphql.schema.idl.SchemaParser;
import graphql.schema.idl.TypeDefinitionRegistry;
import graphql.schema.idl.WiringFactory;

@ApplicationScoped
public class GraphQLManager {

	private static final Logger LOG = Logger.getLogger(GraphQLManager.class.getName());

	private GraphQL graphQL;

	@Inject
	ModuleManager moduleManager;

	@Inject
	@GraphQLWire
	Event<Builder> runtimeWireBuilder;

	@PostConstruct
	public void init() {

		TypeDefinitionRegistry typeRegistry = new TypeDefinitionRegistry();
		SchemaParser schemaParser = new SchemaParser();
		// TODO allow graphql plugin injectiion. Tricky, because GraphQL is also
		// produced. Perhaps try Optional?
//		TypeDefinitionRegistry typeDefinitionRegistry = schemaParser.parse(new InputStreamReader(
//				Thread.currentThread().getContextClassLoader().getResourceAsStream("META-INF/etlu-app.graphql")));
		// typeRegistry.merge(typeDefinitionRegistry);

		Builder runtimeWiringBuilder = RuntimeWiring.newRuntimeWiring();

		runtimeWiringBuilder.wiringFactory(new WiringFactory() {

			@Override
			public DataFetcher getDefaultDataFetcher(FieldWiringEnvironment environment) {

				return new JSONPropertyDataFetcher(environment.getFieldDefinition().getName());

			}
		});

		runtimeWiringBuilder.scalar(DATE);
		runtimeWiringBuilder.scalar(DATETIME);

		runtimeWireBuilder.fire(runtimeWiringBuilder);

		for (ModuleInstance<?> module : moduleManager.getModules()) {
			com.github.aaronanderson.etlu.runtime.spi.GraphQLSchema graphQLSchema = module.getModule().getClass()
					.getAnnotation(com.github.aaronanderson.etlu.runtime.spi.GraphQLSchema.class);
			if (graphQLSchema != null) {
				InputStream is = module.getClass().getResourceAsStream(graphQLSchema.value());
				if (is != null) {
					TypeDefinitionRegistry typeDefinitionRegistry = schemaParser.parse(new InputStreamReader(is));
					typeRegistry.merge(typeDefinitionRegistry);
					// invokeWireBuilder(module, runtimeWiringBuilder);

				} else {
					LOG.log(Level.SEVERE, String.format("Module %s GraphQL schema path %s is unavailable",
							module.getPath(), graphQLSchema.value()));
				}
			}

		}

		RuntimeWiring runtimeWiring = runtimeWiringBuilder.build();

		SchemaGenerator schemaGenerator = new SchemaGenerator();
		GraphQLSchema graphQLSchema = schemaGenerator.makeExecutableSchema(typeRegistry, runtimeWiring);

		graphQL = GraphQL.newGraphQL(graphQLSchema).build();

	}

	@Produces
	public GraphQL graphQL() {
		return graphQL;
	}

//	public void invokeWireBuilder(ModuleInstance<?> module, Builder runtimeWiringBuilder) {
//		try {
//			Util.invoke(module.getModule(), module.getModule().getClass(), new AnnotationFilter(GraphQLWire.class),
//					(args, types) -> {
//						for (int i = 0; i < args.length; i++) {
//							if (Builder.class.equals(types[i])) {
//								args[i] = runtimeWiringBuilder;
//							}
//						}
//					});
//		} catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
//			LOG.log(Level.SEVERE, "", e);
//		}
//
//	}

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
