package com.github.aaronanderson.etlu.core;

import javax.annotation.Priority;
import javax.enterprise.context.ApplicationScoped;

import com.github.aaronanderson.etlu.runtime.spi.ETLUModule;
import com.github.aaronanderson.etlu.runtime.spi.ETLUModule.ModuleInfo;

@ModuleInfo(name = "Core", path = "core")
@Priority(10)
@ApplicationScoped
public class CoreModule implements ETLUModule {

}
