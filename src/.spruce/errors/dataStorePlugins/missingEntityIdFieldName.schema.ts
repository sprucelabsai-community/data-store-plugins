import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const missingEntityIdFieldNameSchema: SpruceErrors.DataStorePlugins.MissingEntityIdFieldNameSchema  = {
	id: 'missingEntityIdFieldName',
	namespace: 'DataStorePlugins',
	name: 'Missing entity id field name',
	    fields: {
	            /** . */
	            'entityIdFieldName': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(missingEntityIdFieldNameSchema)

export default missingEntityIdFieldNameSchema
