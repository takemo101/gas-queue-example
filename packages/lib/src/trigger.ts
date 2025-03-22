/**
 * GASのプロジェクトトリガーを複数削除する
 *
 * @param names
 * @returns void
 */
const deleteTriggersByName = (name: string): void => {
	const triggers = ScriptApp.getProjectTriggers();

	for (const trigger of triggers) {
		if (trigger.getHandlerFunction() === name) {
			ScriptApp.deleteTrigger(trigger);
			Logger.log(`トリガー "${name}:${trigger.getUniqueId}" を削除しました。`);
		}
	}
};

export { deleteTriggersByName };
