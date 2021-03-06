package com.github.aaronanderson.etlu.runtime.spi;

import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

@Room(type = "Function")
@Retention(RUNTIME)
@Target(TYPE)
public @interface Function {
	String name();
}
