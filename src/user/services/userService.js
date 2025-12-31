exports.userSignup = (UserModel) =>
    catchAsync(async (req, res, next) => {
        req.body.email = req.body.email.toLowerCase();

        const findUser = await UserModel.findOne({
            email: req.body.email,
        });
        if (findUser) {
            return sendResponse.responseSend(
                'Email already Exist',
                StatusCodes.BAD_REQUEST,
                'fail',
                res
            );
        }

        const siteSetting = await new GeneralSettings().getGeneralSettings();

        if (siteSetting.twoFactorAuthRequiredFront === 'yes') {
            const secret = await new GeneralSettings().generateSecretKeyToAuth();
            req.body.appliedBytwoFactorAuth = req.body.isMobile ? 'no' : 'yes';
            req.body.twoFactorAuthVerified = 'no';
            req.body.twoFactorSecretKey = secret;
            req.body.enableTwoFactorAuth = 'yes';
        }

        const defaultUsertype = await new GeneralSettings().getDefaultUsertype();
        req.body.userType = defaultUsertype.id;

        const defaultLanguage = await new GeneralSettings().getDefaultLanguage();
        req.body.notificationLanguage = defaultLanguage.id;

        req.body.signupIpAddress = encryptData(req.clientIp);
        if (!req.body.createdAt) {
            req.body.createdAt = Date.now();
        }
        const newUser = await UserModel.create(req.body);

        // mail sending
        const userObject = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
        };
        new UserActivities().userRegisterProcess(
            SubscriberModel,
            newUser,
            userObject
        );

        return sendResponse.responseSuccess(
            req.i18n.t('common.accountActivationLinkSent'),
            StatusCodes.OK,
            req.i18n.t('common.success'),
            res
        );
    });