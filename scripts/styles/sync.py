# -*- coding: utf-8 -*-

""" Styles Bridge

    A script that synchronizes the Ionic framework styles with Tailwind and DaisyUI
    frameworks.
    The script would likely be run when the styles in Ionic are updated or as part
    of a build process, to ensure that the site or application's styles stay in sync
    with the colors of the brand.

    ionic.css - sync-styles -> tailwind.config

    For development purpose.
    use: python sync.py
"""

import cssutils
import os
import json
import re
import jsbeautifier
import logging
from variables import *

# Disable warns and errs
cssutils.log.setLevel(logging.CRITICAL)

def parse_json(file_path):
    if os.path.isfile(file_path):
        text_file = open(file_path, "r")
        return json.load(text_file)

def get_css_properties_from_file(key, file_path):

    if os.path.isfile(file_path):
        text_file = open(file_path, "r")
        data = text_file.read()
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

def create_tailwind_theme(dict):
    theme = {}
    variables = parse_json(VARS_MAP)
    for key in dict:
        if key in variables:
            theme[variables[key]] = dict[key]

    return theme

def generate_plugins():
    plugins = ""
    for plugin in PLUGINS:
        plugins += 'require(\"'+plugin+'\"),'
    return plugins[:-1]

def create_tailwind_config(theme_dict):

    json_file = open(TAILWIND_TEMPLATE_FILE_PATH, "r")
    tailwind_config = json.load(json_file)
    json_file.close()

    tailwind_config["daisyui"]["themes"] = [theme_dict]

    con_str = json.dumps(tailwind_config)

    plugins = generate_plugins()
    insert_index = con_str.find('\"plugins\": [') + len('\"plugins\": [')
    # Insert plugins
    tailwind = "module.exports = " +con_str[:insert_index] + plugins + con_str[insert_index:]

    # Beautify javascript code
    res = jsbeautifier.beautify(tailwind)
    write_tailwind_file(res)

def write_tailwind_file(config):
    text_file = open(TAILWIND_CONFIG_FILE_PATH, "w")
    text_file.write(config)
    text_file.close()

def print_header():
    print("\n")
    print(SCRIPT_TITLE_1)
    print(SCRIPT_TITLE_2)
    print("__________________ Styles Bridge ___________________")

def main():
    print_header()
    print("[LOG]: Syncing...  {} themes".format(len(CSS_KEY_FILES)))
    themes = dict()

    css_files = parse_json(CSS_KEY_FILES)
    for item in css_files:
        try:
          properties = get_css_properties_from_file(item["css_key"], item["file_path"])
          theme = get_css_properties_from_CSSStyleDeclaration(properties)

          themes[item["theme_name"]] = create_tailwind_theme(theme)
          print("\t✅ {} ".format(item["theme_name"]))
        except:
          print("\t❌ {} ".format(item["theme_name"]))

    create_tailwind_config(themes)

if __name__ == "__main__":
    main()
