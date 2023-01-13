# -*- coding: utf-8 -*-
import cssutils
import os
from variables import *

def get_css_properties_from_file(key, file_path):
    if os.path.isfile(file_path):
        # open text file in read mode
        text_file = open(file_path, "r")
        # read whole file to a string
        data = text_file.read()
        # close file
        text_file.close()

        sheet = cssutils.parseString(data)

        properties = set()
        for rule in sheet:
            if rule.type == rule.STYLE_RULE:
                if rule.selectorText == key:
                    properties = rule.style
        return properties

def get_css_properties_from_CSSStyleDeclaration(properties):
    dict = {}
    for property in properties:
            dict[property.name] = property.value
    return dict

def main():
    root_properties = get_css_properties_from_file(ROOT,ROOT_PATH)
    dict = get_css_properties_from_CSSStyleDeclaration(root_properties)
    print("dict")
    print(dict)

if __name__ == "__main__":
    main()
