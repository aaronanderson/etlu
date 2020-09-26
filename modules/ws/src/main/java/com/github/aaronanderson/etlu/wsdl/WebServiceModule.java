package com.github.aaronanderson.etlu.wsdl;

import javax.enterprise.context.ApplicationScoped;

import com.github.aaronanderson.etlu.runtime.spi.ETLUModule;
import com.github.aaronanderson.etlu.runtime.spi.ETLUModule.ModuleInfo;

@ModuleInfo(name = "WebService", path = "ws")
@ApplicationScoped
public class WebServiceModule implements ETLUModule {

}
