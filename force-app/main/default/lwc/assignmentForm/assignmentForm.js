import { LightningElement, wire ,api} from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import ASSIGNMENT_OBJECT from '@salesforce/schema/Assignment__c';
import STATUS_FIELD from '@salesforce/schema/Assignment__c.Status__c';
import upsertAssignmentRecord from '@salesforce/apex/AssignmentFormController.upsertAssignmentRecord';

export default class AssignmentForm extends LightningElement {

    @wire(getObjectInfo, { objectApiName: ASSIGNMENT_OBJECT }) 
    objectInfo;

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: STATUS_FIELD})
    statusPicklistValues;

    @api assignmentObjData = {};

    handleAssignmentValueChange(event){
        let assignmentObjDataLet = {...this.assignmentObjData};
        assignmentObjDataLet[event.target.name] = event.target.value;
        this.assignmentObjData = assignmentObjDataLet;
    }

    connectedCallback() {
        console.log('assignmentObjData--'+JSON.stringify(this.assignmentObjData))
    }

    @api saveData(){
        let isError = this.checkIfError();
        console.log('isError--'+isError);
        if(isError == true){

            upsertAssignmentRecord({ assignmentRecordData : JSON.stringify(this.assignmentObjData)})
            .then(result => {
                console.log('result---'+JSON.stringify(result));
                this.assignmentObjData = result;
                this.dispatchEvent(new CustomEvent("success"));
            })
            .catch(error => {
                console.error(error);
            });

        }

    }

    checkIfError (){
        var areAllValid = true; 
        var focusCheck = false;

        var inputs = this.template.querySelectorAll('.inputfield');
        var i=0;
        inputs.forEach(input =>{
            if (!input.checkValidity()){
                 input.reportValidity();
                if(i==0){
                    input.focus() ;
                    i++;
                    focusCheck = true;
                } 
                areAllValid=false;
                }
        });
        return areAllValid;
        
    }

}