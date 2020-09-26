package com.github.aaronanderson.etlu.excel;

import javax.enterprise.context.ApplicationScoped;

import com.github.aaronanderson.etlu.runtime.spi.ETLUModule;
import com.github.aaronanderson.etlu.runtime.spi.ETLUModule.ModuleInfo;

@ModuleInfo(name = "Excel", path = "excel")
@ApplicationScoped
public class ExcelModule implements ETLUModule {

}
