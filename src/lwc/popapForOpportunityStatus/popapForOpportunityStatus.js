import {LightningElement, track, api, wire} from 'lwc';
import getPicklistsLabelAndValueReason
    from '@salesforce/apex/ControllerChangeOppStatus.getPicklistsLabelAndValueReason';
import getPicklistsLabelAndValueProposalType
    from '@salesforce/apex/ControllerChangeOppStatus.getPicklistsLabelAndValueProposalType';
import getPicklistsLabelAndValuePricingModel
    from '@salesforce/apex/ControllerChangeOppStatus.getPicklistsLabelAndValuePricingModel';
import getOpp
    from '@salesforce/apex/ControllerChangeOppStatus.getOpp';

export default class PopapForOpportunityStatus extends LightningElement {
    @track statusValue = '';
    @api recordId;
    @api listPicklistStageClosed;
    @api statusOpportunity;

    @track listPicklistReason;
    @track PicklistsLabelAndValueReason = [];

    @track PicklistsLabelAndValueProposalType = [];
    @track listPicklistProposalType;

    @track PicklistsLabelAndValuePricingModel = [];
    @track listPicklistPricingModel;

    @track  boolDeferred = false;
    @track  boolClosedWon = false;
    @track  boolClosedLost = false;
    @track  boolReason = false;
    @track  boolReasonOther = false;
    @track  boolProposal = false;
    @track  boolCaseRate = false;

    @track  boolStageName = false;

    @track newStageAndDependencies = {};
    @track oppInformation = {};


//  --------------------------------------------------------------------------------------------------------------------
    // todo метод для сбора информации об данном Opp
    connectedCallback() {
        getOpp({recordId: this.recordId})
            .then(result => {
                let jsonOpp = JSON.stringify(result);
                console.log('this.jsonOpp :: ' , jsonOpp)
                this.oppInformation = JSON.parse(jsonOpp);
                console.log('this.oppInformation :: ' , this.oppInformation)
                this.newStageAndDependencies = JSON.parse(jsonOpp);
                console.log('this.newStageAndDependencies :: ' , this.newStageAndDependencies)
                if (this.statusOpportunity == 'Proposal') {
                    this.statusValue = this.statusOpportunity;
                    this.newStageAndDependencies.StageName = this.statusValue;
                    this.boolStageName = true;
                    this.boolProposal = true;
                    this.listPicklistStageClosed = [
                        {value: 'Proposal', label: 'Proposal'}
                    ];
                } else {
                    this.boolProposal = false;
                    this.statusValue = this.oppInformation.StageName;
                }
                this.boolForShowField(this.newStageAndDependencies);
                this.fillingPickListReason(this.statusValue);
            })
            .catch(error => {
                this.error = error;
            })
    }

//  --------------------------------------------------------------------------------------------------------------------
    //todo метод для закрытия попапа WithData
    handleCloseModalWithData() {
        this.dispatchEvent(new CustomEvent('cancel'));
    }

//  --------------------------------------------------------------------------------------------------------------------
    //todo метод сохранения новой WithData
    handleSaveMethodWithData() {
        let boolHandleFillingValidation = this.handleFillingValidation();
        if (boolHandleFillingValidation) {
            this.sendClosedStage();
            this.handleCloseModalWithData();
        }
    }

//  --------------------------------------------------------------------------------------------------------------------
    //todo проверка заполнения всех обезательных  полей при создании опросника
    handleFillingValidation() {
        const allValid = [...this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-dual-listbox, lightning-textarea')]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);
        return allValid;
    }

//  --------------------------------------------------------------------------------------------------------------------
    //todo проверка заполнения всех обезательных  полей при создании опросника
    changeStatus(event) {
        const field = event.target.dataset.fieldname;
        let fieldValue = event.target.value;

        if (fieldValue == this.oppInformation.StageName) {
            this.newStageAndDependencies = this.oppInformation;
        } else {
            this.newStageAndDependencies[field] = fieldValue;
            this.newStageAndDependencies.Reason__c = '';
            // this.newStageAndDependencies.Amount = '';
            this.newStageAndDependencies.OtherReasons__c = null;

        }
        this.statusValue = field == 'StageName' ? fieldValue : this.statusValue;

        this.boolForShowField(this.newStageAndDependencies);
        this.fillingPickListReason(this.statusValue);
    }

//  --------------------------------------------------------------------------------------------------------------------
    //todo проверка заполнения всех обезательных  полей при создании опросника
    handleAddValueToObject(event) {
        const field = event.target.dataset.fieldname;
        let fieldValue = event.target.value;

        this.newStageAndDependencies[field] = fieldValue;

        this.boolForShowField(this.newStageAndDependencies);
        this.fillingPickListReason(this.statusValue);
    }

//  --------------------------------------------------------------------------------------------------------------------
    //todo проверка заполнения всех обезательных  полей при создании опросника
    boolForShowField(obj) {
        this.boolDeferred = obj.StageName == 'Deferred' ? true : false;
        this.boolClosedWon = obj.StageName == 'Closed Won' ? true : false;
        this.boolClosedLost = obj.StageName == 'Closed Lost' ? true : false;
        this.boolReason = this.boolClosedWon || this.boolClosedLost ? true : false;
        this.boolReasonOther = obj.Reason__c == 'Lost - Other' || obj.Reason__c == 'Won - Other' ? true : false;
        this.boolProposal = obj.StageName == 'Proposal' ? true : false;
        this.boolCaseRate = obj.Pricing_Model__c == 'Case Rate' ? true : false;

        obj.CaseRateAmount__c = obj.Pricing_Model__c == "PEPM" ? null : obj.CaseRateAmount__c;

    }

//  --------------------------------------------------------------------------------------------------------------------
    //todo проверка заполнения всех обезательных  полей при создании опросника
    fillingPickListReason(status) {
        this.listPicklistReason = [];
        this.PicklistsLabelAndValueReason.forEach(item => {
            if (status == 'Closed Lost' && item.includes('Lost')) {
                this.listPicklistReason.push({label: item, value: item});
            } else if (status == 'Closed Won' && item.includes('Won')) {
                this.listPicklistReason.push({label: item, value: item});
            }
        });
    }

//  --------------------------------------------------------------------------------------------------------------------
    // todo метод для сбора пиклиста StageName
    @wire(getPicklistsLabelAndValueReason)
    wiredGetPicklistLabelAndValue(result) {
        if (result.data) {
            this.PicklistsLabelAndValueReason = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.listPicklistReason = undefined;
        }
    }

//  --------------------------------------------------------------------------------------------------------------------
    // todo метод для сбора пиклиста StageName
    @wire(getPicklistsLabelAndValueProposalType)
    wiredGetProposalTypePicklistLabelAndValue(result) {
        if (result.data) {
            this.PicklistsLabelAndValueProposalType = result.data;
            this.listPicklistProposalType = [];
            this.PicklistsLabelAndValueProposalType.forEach(item => {
                this.listPicklistProposalType.push({label: item, value: item});
            });

            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.listPicklistProposalType = undefined;
        }
    }


    //  --------------------------------------------------------------------------------------------------------------------
    // todo метод для сбора пиклиста StageName
    @wire(getPicklistsLabelAndValuePricingModel)
    wiredGetPricingModelPicklistLabelAndValue(result) {
        if (result.data) {
            this.PicklistsLabelAndValuePricingModel = result.data;
            this.listPicklistPricingModel = [];
            this.PicklistsLabelAndValuePricingModel.forEach(item => {
                this.listPicklistPricingModel.push({label: item, value: item});
            });

            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.listPicklistPricingModel = undefined;
        }
    }

//  --------------------------------------------------------------------------------------------------------------------
    //todo проверка заполнения всех обезательных  полей при создании опросника
    sendClosedStage() {
        this.listPicklistStageClosed.forEach(item => {
            if (item.value == this.newStageAndDependencies.StageName) {
                this.newStageAndDependencies.sortOrder = item.sortOrder;
            }
        });
        this.dispatchEvent(new CustomEvent('sendclosedstage', {detail: this.newStageAndDependencies}));
    }
}