import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const missingPeriodIdFieldNameSchema: SpruceErrors.DataStorePlugins.MissingPeriodIdFieldNameSchema  = {
	id: 'missingPeriodIdFieldName',
	namespace: 'DataStorePlugins',
	name: 'Missing period id field name',
	    fields: {
	            /** . */
	            'periodIdFieldName': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(missingPeriodIdFieldNameSchema)

export default missingPeriodIdFieldNameSchema
