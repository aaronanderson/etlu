package com.github.aaronanderson.etlu.runtime.spi;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import javax.enterprise.util.Nonbinding;
import javax.inject.Qualifier;

@Inherited
@Qualifier
@Retention(RUNTIME)
@Target({ FIELD, METHOD })
public @interface AvroSchema {
	
	@Nonbinding
	String name() default "";

	@Nonbinding
	String namespace() default "";
}
