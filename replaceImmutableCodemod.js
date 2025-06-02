/**
 * Codemod to replace Immutable.js patterns with plain JS equivalents,
 * accurately handling chained .set and .setIn calls by grouping operations into a single object merge.
 * Now skips inner chained calls to avoid incomplete transforms.
 *
 * Usage:
 *   npx jscodeshift -t replaceImmutableCodemod.js <path>
 */

module.exports = function transformer(file, api) {
	const j = api.jscodeshift;
	const root = j(file.source);

	/** Build a nested object merge expression */
	function buildMerge(baseExpr, mods) {
		const props = Object.keys(mods).map((key) => {
			const value = mods[key];
			const keyId = j.identifier(key);
			if (value && value.__isValueNode) {
				return j.property('init', keyId, value.node);
			} else {
				const nestedExpr = buildMerge(
					j.memberExpression(baseExpr, keyId, false),
					value,
				);
				return j.property('init', keyId, nestedExpr);
			}
		});
		return j.objectExpression([j.spreadElement(baseExpr), ...props]);
	}

	// Wrap actual value nodes
	function wrapValue(node) {
		return { __isValueNode: true, node };
	}

	// 1️⃣ fromJS(...) → structuredClone(...)
	root
		.find(j.CallExpression, { callee: { name: 'fromJS' } })
		.replaceWith((path) =>
			j.callExpression(j.identifier('structuredClone'), path.node.arguments),
		);

	// 2️⃣ .getIn([...]) → optional chaining
	root
		.find(j.CallExpression, { callee: { property: { name: 'getIn' } } })
		.replaceWith((path) => {
			const obj = path.node.callee.object;
			const [arrNode] = path.node.arguments;
			if (arrNode.type === 'ArrayExpression') {
				return arrNode.elements.reduce(
					(expr, elem) => j.optionalMemberExpression(expr, elem, true),
					obj,
				);
			}
			return path.node;
		});

	// 3️⃣ .get('key') → obj.key
	root
		.find(j.CallExpression, { callee: { property: { name: 'get' } } })
		.replaceWith((path) => {
			const obj = path.node.callee.object;
			const [keyNode] = path.node.arguments;
			return j.memberExpression(obj, keyNode, true);
		});

	// 4️⃣ Grouped .set / .setIn operations -> single merge
	root
		.find(j.CallExpression, {
			callee: {
				property: { name: (name) => name === 'set' || name === 'setIn' },
			},
		})
		.filter((path) => {
			const parent = path.parent.node;
			const grandparent = path.parent.parent && path.parent.parent.node;
			// skip inner chained calls (parent is MemberExpression and grandparent is CallExpression)
			if (
				j.MemberExpression.check(parent) &&
				grandparent &&
				grandparent.type === 'CallExpression'
			) {
				return false;
			}
			return true;
		})
		.replaceWith((path) => {
			// collect operations
			const ops = [];
			let current = path.node;
			while (
				j.CallExpression.check(current) &&
				j.MemberExpression.check(current.callee) &&
				(current.callee.property.name === 'set' ||
					current.callee.property.name === 'setIn')
			) {
				ops.unshift({
					name: current.callee.property.name,
					args: current.arguments,
				});
				current = current.callee.object;
			}
			const baseExpr = current;
			const mods = {};

			ops.forEach((op) => {
				if (op.name === 'set') {
					const [keyNode, valueNode] = op.args;
					const key = keyNode.value || keyNode.name;
					mods[key] = wrapValue(valueNode);
				} else {
					const [arrNode, valueNode] = op.args;
					if (arrNode.type === 'ArrayExpression') {
						let cursor = mods;
						arrNode.elements.forEach((el, idx) => {
							const key = el.value || el.name;
							if (idx === arrNode.elements.length - 1) {
								cursor[key] = wrapValue(valueNode);
							} else {
								cursor[key] = cursor[key] || {};
								cursor = cursor[key];
							}
						});
					}
				}
			});

			return buildMerge(baseExpr, mods);
		});

	return root.toSource({ quote: 'single' });
};

// This codemod replaces Immutable.js patterns with plain-JS equivalents.
// It converts fromJS to structuredClone, replaces get/set methods with direct property access,
// and transforms getIn/setIn methods to use optional chaining and nested spreads.
// This allows for a more modern and efficient codebase without relying on Immutable.js.
