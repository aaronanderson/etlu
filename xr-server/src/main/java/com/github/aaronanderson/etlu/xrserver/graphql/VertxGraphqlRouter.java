package com.github.aaronanderson.etlu.xrserver.graphql;

import java.io.InputStreamReader;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.function.BiConsumer;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.enterprise.inject.Produces;
import javax.inject.Inject;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import graphql.GraphQL;
import graphql.language.StringValue;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
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
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.vertx.http.runtime.security.QuarkusHttpUser;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.graphql.ApolloWSHandler;
import io.vertx.ext.web.handler.graphql.GraphQLHandler;
import io.vertx.ext.web.handler.graphql.VertxDataFetcher;
import io.vertx.ext.web.handler.graphql.VertxPropertyDataFetcher;

@ApplicationScoped
public class VertxGraphqlRouter {

	@Inject
	Vertx vertx;

	private GraphQL graphQL;
	// TODO switch to ignite cache as source
	private JsonArray projects = new JsonArray();

	@PostConstruct
	public void init() {
		projects.add(new JsonObject().put("name", "ETLU Test").put("id", newID()));

	}

	@PreDestroy
	public void destroy() {
		projects.clear();
	}

	@Produces
	public GraphQL graphQL() {
		return graphQL;
	}

	public void setupRouter(@Observes Router router) {
		// String schema = "type Query{hello: String}";

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

				return new VertxPropertyDataFetcher(environment.getFieldDefinition().getName());

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

		GraphQL graphQL = GraphQL.newGraphQL(graphQLSchema).build();

		router.route("/graphql").handler(ApolloWSHandler.create(graphQL));
		router.route("/graphql").handler(GraphQLHandler.create(graphQL));// .queryContext(routingContext ->
																			// newContext(routingContext)));
	}

	private SecurityIdentity newContext(RoutingContext routingContext) {
		QuarkusHttpUser user = (QuarkusHttpUser) routingContext.user();
		return user.getSecurityIdentity();
	}

	private BlockingVertxDataFetcher<JsonObject> projects() {
		return new BlockingVertxDataFetcher<>(vertx, (environment, future) -> {
			future.complete(new JsonObject().put("projects", projects));
		});
	}

	private VertxDataFetcher<JsonObject> createProject() {
		return new VertxDataFetcher<>((environment, future) -> {
			// Only maps are allowed for inputs
			// https://stackoverflow.com/questions/54257346/graphql-use-input-type-to-search-data

			Map<String, Object> input = environment.getArgument("input");
			JsonObject location = new JsonObject();
			location.put("name", input.get("name"));
			future.complete(location);

		});
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

	private static String newID() {
		return UUID.randomUUID().toString().replaceAll("-", "");
	}

	// based on io.vertx.ext.web.handler.graphql.VertxDataFetcher
	public static class BlockingVertxDataFetcher<T> implements DataFetcher<CompletionStage<T>> {

		private final BiConsumer<DataFetchingEnvironment, Promise<T>> dataFetcher;
		private final Vertx vertx;

		public BlockingVertxDataFetcher(Vertx vertx, BiConsumer<DataFetchingEnvironment, Promise<T>> dataFetcher) {
			this.vertx = vertx;
			this.dataFetcher = dataFetcher;
		}

		@Override
		public CompletionStage<T> get(DataFetchingEnvironment environment) throws Exception {
			CompletableFuture<T> cf = new CompletableFuture<>();

			vertx.executeBlocking((Promise<T> ar) -> {
				dataFetcher.accept(environment, ar);
			}, ar -> {

				if (ar.succeeded()) {
					cf.complete(ar.result());
				} else {
					cf.completeExceptionally(ar.cause());
				}

			});
			return cf;
		}
	}

}