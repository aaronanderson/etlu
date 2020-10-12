package com.github.aaronanderson.etlu.runtime.spi;

import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

import javax.enterprise.inject.Instance;

public class Util {
	
	
	

	@FunctionalInterface
	public static interface InvocationFilter {

		public boolean matches(Method method);

	}
	
	public static class AnnotationFilter implements InvocationFilter {

		private final Class annotationType;

		public AnnotationFilter(Class annotationType) {
			this.annotationType = annotationType;
		}

		@Override
		public boolean matches(Method method) {
			return method.getDeclaredAnnotation(annotationType) != null;
		}

	}
	
	
	@FunctionalInterface
	public static interface ParameterInitializer {

		public void initialize(Object[] parameters, Class<?>[] parameterTypes);

	}

	public static class DefaultParameterInitializer implements ParameterInitializer {

		private final Set<Object> parameterCache = new HashSet<>();
		private final Function<Class<?>, Object> defaultHandler;

		public DefaultParameterInitializer(Function<Class<?>, Object> defaultHandler, Object... parameters) {
			this.defaultHandler = defaultHandler;
			for (Object parameter : parameters) {
				parameterCache.add(parameter);
			}
		}

		@Override
		public void initialize(Object[] parameters, Class<?>[] parameterTypes) {
			for (int i = 0; i < parameters.length; i++) {
				Iterator<?> parameterIterator = parameterCache.iterator();
				while (parameterIterator.hasNext()) {
					Object candidate = parameterIterator.next();
					if (parameterTypes[i].isAssignableFrom(candidate.getClass())) {
						parameters[i] = candidate;
						parameterIterator.remove();
						break;
					}
				}
				if (parameters[i] == null && defaultHandler != null) {
					parameters[i] = defaultHandler.apply(parameterTypes[i]);
				}
			}
		}

	}
	
	
	
	public static <I, R> R invoke(I instance, Class<?> clazz, InvocationFilter filter, ParameterInitializer paramInitializer) throws IllegalAccessException, IllegalArgumentException, InvocationTargetException {
		if (!Object.class.equals(clazz)) {
			for (Method method : clazz.getDeclaredMethods()) {
				if (filter.matches(method)) {
					Object result = invoke(instance, method, paramInitializer);
					if (result != null) {
						return (R) result;
					}
				}
			}
			if (null != clazz.getSuperclass()) {
				Object result = invoke(instance, clazz.getSuperclass(), filter, paramInitializer);
				if (result != null) {
					return (R) result;
				}
			}
		}
		return null;
	}
	
	public static <I, R> R invoke(I instance, Method method, ParameterInitializer paramInitializer) throws IllegalAccessException, IllegalArgumentException, InvocationTargetException {
		Object[] args = new Object[method.getParameterCount()];
		paramInitializer.initialize(args, method.getParameterTypes());

		return (R) method.invoke(instance, args);

	}
	
	
	
	public static <I, K> void index(Instance<I> instances, Map<K, List<Invocation<I>>> methodCache, MethodIndexer<I, K> methodIndexer) throws IllegalAccessException, IllegalArgumentException, InvocationTargetException {
		for (I instance : instances) {
			Util.index(instance, instance.getClass(), methodCache, methodIndexer);
		}
	}

	public static <I, K> void index(I instance, Class<?> clazz, Map<K, List<Invocation<I>>> methodCache, MethodIndexer<I, K> methodIndexer) throws IllegalAccessException, IllegalArgumentException, InvocationTargetException {
		if (!Object.class.equals(clazz)) {
			for (Method method : clazz.getDeclaredMethods()) {
				methodIndexer.index(instance, method, methodCache);
			}
			if (null != clazz.getSuperclass()) {
				index(instance, clazz.getSuperclass(), methodCache, methodIndexer);
			}
		}
	}

	public static class Invocation<I> {
		private final I instance;
		private final Method method;
		private final MethodHandle methodHandle;
		private final int priority;

		public Invocation(I instance, Method method) throws IllegalAccessException {
			this(instance, method, 10);
		}

		public Invocation(I instance, Method method, int priority) throws IllegalAccessException {
			this.instance = instance;
			this.method = method;
			this.methodHandle = MethodHandles.lookup().unreflect(method).asSpreader(Object[].class, method.getParameterCount()).bindTo(instance);
			this.priority = priority;
		}

		public I getInstance() {
			return instance;
		}

		public Method getMethod() {
			return method;
		}

		public MethodHandle getMethodHandle() {
			return methodHandle;
		}

		public int getPriority() {
			return priority;
		}

	}

	@FunctionalInterface
	public static interface MethodIndexer<I, K> {

		public void index(I instance, Method method, Map<K, List<Invocation<I>>> methodCache) throws IllegalArgumentException, IllegalAccessException;

	}
	
	public static <I, K, R, E extends Exception> R invoke(K key, Map<K, List<Invocation<I>>> methodCache, ParameterInitializer paramInitializer, Function<Throwable, E> errorHandler) throws E {
		try {
			return invoke(key, methodCache, paramInitializer);
		} catch (Throwable t) {
			throw errorHandler.apply(t);
		}
	}
	
	public static <I, K, R> R invoke(K key, Map<K, List<Invocation<I>>> methodCache, ParameterInitializer paramInitializer) throws Throwable {
		List<Invocation<I>> invocations = methodCache.get(key);
		if (invocations != null) {
			for (Invocation<I> invocation : invocations) {
				Object[] args = new Object[invocation.getMethod().getParameterCount()];
				paramInitializer.initialize(args, invocation.getMethod().getParameterTypes());
				// Object[] invokArgs = new Object[invocation.getMethod().getParameterCount() + 1];
				// invokArgs[0] = invocation.getInstance();
				// System.arraycopy(args, 0, invokArgs, 1, args.length);
				Object returnValue = invocation.getMethodHandle().invoke(args);
				if (returnValue != null) {
					return (R) returnValue;
				}

			}
		}
		return null;

	}

}
