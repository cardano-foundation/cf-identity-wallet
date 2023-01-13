# -*- coding: utf-8 -*-
import cssutils
import os
import json
import re
import jsbeautifier
from variables import *

def get_css_properties_from_file(key, file_path):

    if os.path.isfile(file_path):
        # open text file in read mode
        text_file = open(file_path, "r")
        # read whole file to a string
        data = text_file.read()
        # close file
        text_file.close()

        # parse css
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

def create_tailwind_theme(dict):
    print("create_tailwind_theme")
    print(dict)
    theme = {}
    for key in dict:
      if key in VARS_MAP.keys():
        theme[VARS_MAP[key]] = dict[key]

    return theme

def generate_plugins():
    plugins = ""
    for plugin in PLUGINS:
        plugins += 'require(\"'+plugin+'\"),'
    return plugins[:-1]

def create_tailwind_config(theme_list):

    json_file = open("tailwind.config.template.json")
    tailwind_config = json.load(json_file)

    tailwind_config["daisyui"]["themes"] = theme_list

    con_str = json.dumps(tailwind_config)

    plugins = generate_plugins()
    insert_index = con_str.find('\"plugins\": [') + len('\"plugins\": [')

    tailwind = "module.exports = " +con_str[:insert_index] + plugins + con_str[insert_index:]

    res = jsbeautifier.beautify(tailwind)
    write_tailwind_file(res)


def write_tailwind_file(config):
    #open text file
    text_file = open("../../test-tailwind.config.js", "w")

    #write string to file
    text_file.write(config)

    #close file
    text_file.close()

def main():
    root_properties = get_css_properties_from_file(ROOT, ROOT_PATH)
    light = get_css_properties_from_CSSStyleDeclaration(root_properties)
    print("light")
    print(light)

    root_properties = get_css_properties_from_file(BODY_DARK, DARK_CSS_PATH)
    dark = get_css_properties_from_CSSStyleDeclaration(root_properties)
    print("dark")
    print(dark)

    root_properties = get_css_properties_from_file(BODY_DARK_IOS, DARK_IOS_CSS_PATH)
    dark_ios = get_css_properties_from_CSSStyleDeclaration(root_properties)
    print("dark ios")
    print(dark_ios)

    root_properties = get_css_properties_from_file(BODY_DARK_MD, DARK_MD_CSS_PATH)
    dark_md = get_css_properties_from_CSSStyleDeclaration(root_properties)
    print("dark md")
    print(dark_md)

    light_theme = create_tailwind_theme(light)
    dark_theme = create_tailwind_theme(dark)

    print("")
    print("")
    print("dark_ios_theme")
    dark_ios_theme = create_tailwind_theme(dark_ios)
    print(dark_ios_theme)

    print("")
    print("")
    print("dark_md_theme")
    dark_md_theme = create_tailwind_theme(dark_md)
    print("dark_md_theme")
    print(dark_md_theme)

    create_tailwind_config(dict(light=light_theme, dark=dark_theme, dark_ios=dark_ios_theme, dark_md=dark_md_theme))

if __name__ == "__main__":
    main()
