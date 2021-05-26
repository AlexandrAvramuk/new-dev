public class CMN_SObjectUtils {

    public static List<String> getPicklistValues(String sObjectName, String sObjectField) {
        Type objType = Type.forName(sObjectName);
        Schema.DescribeSObjectResult        desSObjResult           = ((Sobject)objType.newInstance()).getSObjectType().getDescribe();
        Map<String, Schema.SObjectField>    sObjFieldMap            = desSObjResult.fields.getMap();
        Schema.DescribeFieldResult          fieldDescResult         = sObjFieldMap.get(sObjectField).getDescribe();
        List<Schema.PicklistEntry>          pickListValues          = fieldDescResult.getPicklistValues();

        List<String> picklistItems = new List<String>();
        for (Schema.PicklistEntry e : pickListValues){
            picklistItems.add(e.getValue());
        }
        return picklistItems;
    }

    public static String getPicklistLabel(String sObjectName, String sObjectField, String api) {
        String pickLabel;
        Type objType	 = Type.forName(sObjectName);

        Schema.DescribeSObjectResult        desSObjResult           = ((Sobject)objType.newInstance()).getSObjectType().getDescribe();
        Map<String, Schema.SObjectField>    sObjFieldMap            = desSObjResult.fields.getMap();
        Schema.DescribeFieldResult          fieldDescResult         = sObjFieldMap.get(sObjectField).getDescribe();
        List<Schema.PicklistEntry> 			pickList 				= fieldDescResult.getPicklistValues();

        for (Schema.PicklistEntry item : pickList) {
            pickLabel = item.getValue() == api  ? item.getLabel() : null ;
            if(pickLabel != null)break;
        }

        return pickLabel;
    }

    public static Map<String, String> getMapValueLabelPicklist(String sObjectName, String sObjectField) {

        Map<String, String> mapValueLabel = new Map<String, String>();
        List<String> picklistValues = CMN_SObjectUtils.getPicklistValues(sObjectName, sObjectField);

        for (String item : picklistValues) {
            mapValueLabel.put(item, CMN_SObjectUtils.getPicklistLabel(sObjectName, sObjectField, item));
        }

        return mapValueLabel;
    }

    public static Map<String, Map<String, String>> getMapValueLabelPicklist(String sObjectName, List<String>  sObjectField) {

        Map<String, List<String>> nameObjectAndPicklistFields = new Map<String, List<String>>();

        nameObjectAndPicklistFields.put(sObjectName ,sObjectField);

        Map<String, Map<String, String>> fieldSobjectMap = new Map<String,  Map<String,String>>();

        for(String itemKey : nameObjectAndPicklistFields.keySet()){
            for(String itemValue : nameObjectAndPicklistFields.get(itemKey)) {
                List<String> picklistValues = CMN_SObjectUtils.getPicklistValues(itemKey, itemValue);

                Map<String, String> valuesLabels = new Map<String,  String>();
                for (String item : picklistValues) {

                    valuesLabels.put(item, CMN_SObjectUtils.getPicklistLabel(itemKey, itemValue, item));
                }
                fieldSobjectMap.put(itemValue, valuesLabels);
            }
        }
        return fieldSobjectMap;
    }

}