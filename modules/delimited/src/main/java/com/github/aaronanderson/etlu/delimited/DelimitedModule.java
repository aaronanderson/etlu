package com.github.aaronanderson.etlu.delimited;

import javax.enterprise.context.ApplicationScoped;

import com.github.aaronanderson.etlu.runtime.spi.ETLUModule;
import com.github.aaronanderson.etlu.runtime.spi.ETLUModule.ModuleInfo;

@ModuleInfo(name = "Delimited", path = "delimited")
@ApplicationScoped
public class DelimitedModule implements ETLUModule {

}
