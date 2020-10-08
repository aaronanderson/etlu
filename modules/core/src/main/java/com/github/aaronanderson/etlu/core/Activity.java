package com.github.aaronanderson.etlu.core;

import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import com.github.aaronanderson.etlu.runtime.spi.Room;

@Room(type = "Activity")
@Retention(RUNTIME)
@Target(TYPE)
public @interface Activity {
	String name();
}
