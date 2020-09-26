package com.github.aaronanderson.etlu.runtime.spi;

import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import javax.enterprise.util.Nonbinding;
import javax.inject.Qualifier;

public interface ETLUModule {

	@Inherited
	@Qualifier
	@Retention(RUNTIME)
	@Target({ TYPE })
	public @interface ModuleInfo {
		String name();

		@Nonbinding
		String path() default "";

	}

}
