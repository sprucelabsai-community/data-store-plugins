import { default as SchemaEntity } from '@sprucelabs/schema'
import * as SpruceSchema from '@sprucelabs/schema'








export declare namespace SpruceErrors.DataStorePlugins {

	
	export interface MissingPeriodIdFieldName {
		
			
			'periodIdFieldName': string
	}

	export interface MissingPeriodIdFieldNameSchema extends SpruceSchema.Schema {
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

	export type MissingPeriodIdFieldNameEntity = SchemaEntity<SpruceErrors.DataStorePlugins.MissingPeriodIdFieldNameSchema>

}


export declare namespace SpruceErrors.DataStorePlugins {

	
	export interface MissingLockField {
		
			
			'lockFieldName': string
	}

	export interface MissingLockFieldSchema extends SpruceSchema.Schema {
		id: 'missingLockField',
		namespace: 'DataStorePlugins',
		name: 'Missing lock field',
		    fields: {
		            /** . */
		            'lockFieldName': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type MissingLockFieldEntity = SchemaEntity<SpruceErrors.DataStorePlugins.MissingLockFieldSchema>

}


export declare namespace SpruceErrors.DataStorePlugins {

	
	export interface MissingEntityIdFieldName {
		
			
			'entityIdFieldName': string
	}

	export interface MissingEntityIdFieldNameSchema extends SpruceSchema.Schema {
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

	export type MissingEntityIdFieldNameEntity = SchemaEntity<SpruceErrors.DataStorePlugins.MissingEntityIdFieldNameSchema>

}


export declare namespace SpruceErrors.DataStorePlugins {

	
	export interface ExpiredLock {
		
			
			'lockFieldName': string
			
			'lockValue': string
	}

	export interface ExpiredLockSchema extends SpruceSchema.Schema {
		id: 'expiredLock',
		namespace: 'DataStorePlugins',
		name: 'Expired lock',
		    fields: {
		            /** . */
		            'lockFieldName': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		            /** . */
		            'lockValue': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type ExpiredLockEntity = SchemaEntity<SpruceErrors.DataStorePlugins.ExpiredLockSchema>

}




