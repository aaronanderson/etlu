package com.github.aaronanderson.etlu.rs.openapi;

import javax.enterprise.context.ApplicationScoped;

import com.github.aaronanderson.etlu.runtime.spi.ETLUModule;
import com.github.aaronanderson.etlu.runtime.spi.ETLUModule.ModuleInfo;

@ModuleInfo(name = "REST", path = "rs")
@ApplicationScoped
public class RESTModule implements ETLUModule {

}
