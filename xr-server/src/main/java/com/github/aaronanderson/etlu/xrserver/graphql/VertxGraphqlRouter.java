package com.github.aaronanderson.etlu.xrserver.graphql;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.function.BiConsumer;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.inject.Inject;

import graphql.GraphQL;
import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.vertx.http.runtime.security.QuarkusHttpUser;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.graphql.ApolloWSHandler;
import io.vertx.ext.web.handler.graphql.GraphQLHandler;

@ApplicationScoped
public class VertxGraphqlRouter {

	@Inject
	Vertx vertx;

	@Inject
	GraphQL graphQL;

	private JsonArray projects = new JsonArray();

	public void setupRouter(@Observes Router router) {
		// GraphQL graphQL = Arc.container().instance(GraphQL.class).get();
		router.route("/graphql").handler(ApolloWSHandler.create(graphQL));
		router.route("/graphql").handler(GraphQLHandler.create(graphQL));// .queryContext(routingContext ->
																			// newContext(routingContext)));
	}

	private SecurityIdentity newContext(RoutingContext routingContext) {
		QuarkusHttpUser user = (QuarkusHttpUser) routingContext.user();
		return user.getSecurityIdentity();
	}

//	private BlockingVertxDataFetcher<JsonObject> projects() {
//		return new BlockingVertxDataFetcher<>(vertx, (environment, future) -> {
//			future.complete(new JsonObject().put("projects", projects));
//		});
//	}
//
//	private VertxDataFetcher<JsonObject> createProject() {
//		return new VertxDataFetcher<>((environment, future) -> {
//			// Only maps are allowed for inputs
//			// https://stackoverflow.com/questions/54257346/graphql-use-input-type-to-search-data
//
//			Map<String, Object> input = environment.getArgument("input");
//			JsonObject location = new JsonObject();
//			location.put("name", input.get("name"));
//			future.complete(location);
//
//		});
//	}

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