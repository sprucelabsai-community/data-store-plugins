import { assertOptions } from '@sprucelabs/schema'
import { assert } from '@sprucelabs/test-utils'
import HistoryPlugin, { HistoryPluginOptions } from './HistoryPlugin'

const historyPluginAssert = {
    pluginHasSettings: (
        plugin: HistoryPlugin,
        settings: HistoryPluginAssertSettings
    ) => {
        assertOptions({ plugin, settings }, ['plugin', 'settings'])

        const fields = [
            'entityCollectionName',
            'entityIdFieldName',
            'periodIdFieldName',
        ]

        for (const field of fields) {
            assert.isEqual(
                //@ts-ignore
                plugin[field],
                //@ts-ignore
                settings[field],
                //@ts-ignore
                `${field} does not match: ${plugin[field]} !== ${settings[field]}`
            )
        }
    },
}

export type HistoryPluginAssertSettings = Omit<HistoryPluginOptions, 'store'>

export default historyPluginAssert
