
import constants from '@/js/constants'
import c2c from '@/js/apis/c2c'

import TabItem from './TabItem'
import TabView from './TabView'

import EditionContainer from './EditionContainer'

import FormRow from './FormRow'
import FormInputRow from './FormInputRow'
import FormInput from './FormInput'

import QualityInputRow from './QualityInputRow'
import MapInputRow from './MapInputRow'
import AssociationsInputRow from './AssociationsInputRow'

export default {

    components:{
        EditionContainer,

        TabView,
        TabItem,

        FormRow,
        FormInputRow,
        FormInput,
        QualityInputRow,
        MapInputRow,
        AssociationsInputRow,

    },

    data() {
        return {
            promise:{},
            fields:null, // keep fields here to set them reactive
            genericErrors:[],
            comment:"",
        }
    },

    computed: {

        mode(){
            return this.$route.name.split("-")[1] // right part of route name : add or edit
        },

        documentType(){
            return this.$route.name.replace(/-(edit|add)/,"")
        },

        documentId(){
            return this.$route.params.id
        },

        lang(){
            return this.$route.params.lang
        },

        document(){
            return this.promise.data
        },

        editedLocale(){
            // in edit mode, there is only one locale
            return this.document ? this.document.locales[0] : null
        }
    },

    created(){
        if(this.mode=="edit")
            this.promise = c2c[this.documentType].get(this.documentId, this.lang).then(this.afterLoad)
        else {
            this.promise = { data : this.$documentUtils.buildDocument(this.documentType, this.lang) }

            // Add associations presents in url query
            for(let letter of Object.keys(this.$route.query)){
                let documentType = this.$documentUtils.getDocumentType(letter)

                if(documentType){
                    // Value may be a number or a string
                    let documentIds = String(this.$route.query[letter]).split(",")

                    for(let documentId of documentIds){
                        c2c[documentType].get(documentId).then(response => {
                            this.$documentUtils.addAssociation(this.document, response.data)
                        })
                    }
                }
            }

            if(this.$route.query.act){
                this.document.activities = this.$route.query.act.split(",")
            }

            this.afterLoad()
        }

        this.fields = constants.objectDefinitions[this.documentType].fields

        this.cleanErrors()
    },

    methods: {
        afterLoad(){

        },

        beforeSave(){

        },

        save(comment){
            this.beforeSave() // allow each view to handle some specific cases

            if (this.hasError())
                return

            let promise

            if(this.mode=="edit"){
                promise = c2c[this.documentType].save(this.document, comment).then(() => {
                    this.$router.push({name:this.documentType, params:{id:this.document.document_id}})
                })
            } else {
                promise = c2c[this.documentType].create(this.document).then(response => {
                    this.$router.push({name:this.documentType, params:{id:response.data.document_id}})
                })
            }

            promise.catch(error => {
                const data = error.response.data
                this.dispatchErrors(data.errors)
            })
        },

        hasError(){
            let hasError = false

            for(let field of Object.values(this.fields)){
                let error = field.getError(this.document, this.editedLocale)
                hasError = hasError || error !==null
                field.error = error
            }

            return hasError
        },

        dispatchErrors(errors){

            // TODO : errors == undefined ?
            this.cleanErrors()

            for(let error of errors){
                let path = error.name.split(".")

                if(path[0]=="locales")
                    this.dispatchError(path[2], error)

                else if(path[0]=="associations")
                    this.dispatchError(path[1], error)

                else
                    this.dispatchError(path[0], error)

            }
        },

        dispatchError(fieldName, error){
            if(this.fields[fieldName] === undefined)
                this.genericErrors.push(error)
            else
                this.fields[fieldName].error = error
        },

        cleanErrors(){
            this.genericErrors = []
            for(let field of Object.values(this.fields))
                field.error = null
        }
    }
}
