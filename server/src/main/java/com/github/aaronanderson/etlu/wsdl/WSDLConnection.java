package com.github.aaronanderson.etlu.wsdl;

import java.util.Map.Entry;

import org.openapi4j.parser.model.v3.Path;

import com.predic8.wsdl.Definitions;
import com.predic8.wsdl.Operation;
import com.predic8.wsdl.WSDLParser;

public class WSDLConnection {

	public static void main(String[] args) {
		WSDLParser parser = new WSDLParser();
		Definitions defs = parser.parse("http://www.dneonline.com/calculator.asmx?wsdl");
		for (Operation op : defs.getOperations()) {
			System.out.format("Operation %s\n", op.getName());
		}
	}
}
