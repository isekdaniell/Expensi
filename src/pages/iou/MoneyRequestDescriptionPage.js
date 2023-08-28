import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import TextInput from '../../components/TextInput';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as IOU from '../../libs/actions/IOU';
import optionPropTypes from '../../components/optionPropTypes';
import CONST from '../../CONST';
import useLocalize from '../../hooks/useLocalize';

const propTypes = {
    /** Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        id: PropTypes.string,
        amount: PropTypes.number,
        comment: PropTypes.string,
        participants: PropTypes.arrayOf(optionPropTypes),
        receiptPath: PropTypes.string,
    }),

    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** Which field we are editing */
            field: PropTypes.string,

            /** reportID for the "transaction thread" */
            threadReportID: PropTypes.string,
        }),
    }).isRequired,

    /** The current tab we have navigated to in the request modal. String that corresponds to the request type. */
    selectedTab: PropTypes.oneOf([CONST.TAB.DISTANCE, CONST.TAB.MANUAL, CONST.TAB.SCAN]).isRequired,
};

const defaultProps = {
    iou: {
        id: '',
        amount: 0,
        comment: '',
        participants: [],
        receiptPath: '',
    },
};

function MoneyRequestDescriptionPage({iou, route, selectedTab}) {
    const {translate} = useLocalize();
    const inputRef = useRef(null);
    const iouType = lodashGet(route, 'params.iouType', '');
    const reportID = lodashGet(route, 'params.reportID', '');
    const isDistanceRequest = selectedTab === CONST.TAB.DISTANCE;

    useEffect(() => {
        const moneyRequestId = `${iouType}${reportID}`;
        const shouldReset = iou.id !== moneyRequestId;
        if (shouldReset) {
            IOU.resetMoneyRequestInfo(moneyRequestId);
        }

        if (!isDistanceRequest && (_.isEmpty(iou.participants) || (iou.amount === 0 && !iou.receiptPath) || shouldReset)) {
            Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType, reportID), true);
        }
    }, [iou.id, iou.participants, iou.amount, iou.receiptPath, iouType, reportID, isDistanceRequest]);

    function navigateBack() {
        Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
    }

    /**
     * Sets the money request comment by saving it to Onyx.
     *
     * @param {Object} value
     * @param {String} value.moneyRequestComment
     */
    function updateComment(value) {
        IOU.setMoneyRequestDescription(value.moneyRequestComment);
        navigateBack();
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            onEntryTransitionEnd={() => inputRef.current && inputRef.current.focus()}
        >
            <HeaderWithBackButton
                title={translate('common.description')}
                onBackButtonPress={() => navigateBack()}
            />
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM}
                onSubmit={(value) => updateComment(value)}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <TextInput
                        inputID="moneyRequestComment"
                        name="moneyRequestComment"
                        defaultValue={iou.comment}
                        label={translate('moneyRequestConfirmationList.whatsItFor')}
                        accessibilityLabel={translate('moneyRequestConfirmationList.whatsItFor')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        ref={(el) => (inputRef.current = el)}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

MoneyRequestDescriptionPage.propTypes = propTypes;
MoneyRequestDescriptionPage.defaultProps = defaultProps;

export default withOnyx({
    iou: {
        key: ONYXKEYS.IOU,
    },
    selectedTab: {
        key: `${ONYXKEYS.SELECTED_TAB}_${CONST.TAB.RECEIPT_TAB_ID}`,
    },
})(MoneyRequestDescriptionPage);
