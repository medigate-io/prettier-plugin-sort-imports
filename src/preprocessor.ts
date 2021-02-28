import { parse as parser, ParserOptions } from '@babel/parser';
import { merge } from 'lodash';
import { loadPartialConfig } from '@babel/core';
import traverse, { NodePath } from '@babel/traverse';
import {
    ImportDeclaration,
    isTSModuleDeclaration,
} from '@babel/types';
import { PrettierParserOptions, getCodeFromAst, getSortedNodes } from './utils';

export function preprocessor(code: string, options: PrettierParserOptions) {
    const { importOrder, importOrderSeparation, importOrderFlow } = options;

    const importNodes: ImportDeclaration[] = [];
    const parserPlugins = ['jsx', 'classProperties'];
    parserOptions.push(importOrderFlow ? 'jsx' : 'typescript');

    const defaultConfig = {
        sourceType: 'module',
        plugins: parserPlugins, 
    } as ParserOptions;
    const babelConfig = loadPartialConfig() as ParserOptions;
    const mergedOptions = merge(defaultConfig, babelConfig);

    const ast = parser(code, mergedOptions);

    traverse(ast, {
        ImportDeclaration(path: NodePath<ImportDeclaration>) {
            const tsModuleParent = path.findParent((p) => isTSModuleDeclaration(p));
            if (!tsModuleParent) {
                importNodes.push(path.node);
            }
        },
    });

    // short-circuit if there are no import declaration
    if (importNodes.length === 0) return code;

    const allImports = getSortedNodes(
        importNodes,
        importOrder,
        importOrderSeparation,
    );

    return getCodeFromAst(allImports, code);
}
