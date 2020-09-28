package com.github.aaronanderson.etlu.core;

import javax.enterprise.context.ApplicationScoped;

import com.github.aaronanderson.etlu.runtime.spi.ETLUModule;
import com.github.aaronanderson.etlu.runtime.spi.ETLUModule.ModuleInfo;

@ModuleInfo(name = "Core", path = "core")
@ApplicationScoped
public class CoreModule implements ETLUModule {

}
