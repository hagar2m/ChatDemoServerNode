const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
exports.sendNotification = functions.firestore
  .document('messages/{groupId1}/{groupId2}/{message}')
  .onCreate((snap, context) => {
    console.log('----------------start function--------------------')
    const doc = snap.data()
    console.log('xxxxxx');
    console.log(doc)
    const idFrom = doc.idFrom
    const idTo = doc.idTo
    const contentMessage = doc.content
    const nameFrom = doc.nameFrom
    const threadId = doc.threadId
    // const data = doc.data
    // Get push token user to (receive)
    if(idTo != '') {
      admin
      .firestore()
      .collection('users')
      .where('id', '==', idTo)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(userTo => {
          console.log(`Found user to: ${userTo.data().nickname}`)
          if (userTo.data().pushToken && userTo.data().chattingWith !== idFrom) {
            // Get info user from (sent)
            admin
              .firestore()
              .collection('users')
              .where('id', '==', idFrom)
              .get()
              .then(querySnapshot2 => {
                querySnapshot2.forEach(userFrom => {
                  console.log(`Found user from: ${userFrom.data().nickname}`)
                  const payload = {
                    notification: {
                      title: `You have a message from "${userFrom.data().nickname}"`,
                      body: contentMessage,
                      badge: '1',
                      sound: 'default'
                    },
                    // data: data 
                  }
                  // Let push to the target device
                  admin
                    .messaging()
                    .sendToDevice(userTo.data().pushToken, payload)
                    .then(response => {
                      console.log('Successfully sent message:', response)
                    })
                    .catch(error => {
                      console.log('Error sending message:', error)
                    })
                    
               
                })
              })
          } else {
            console.log('Can not find pushToken target user')
          }
        })
      })
    } else {
      const payload = {
        notification: {
          title: `You have a message from "${nameFrom}"`,
          body: contentMessage,
          badge: '1',
          sound: 'default'
        },
        // data: data 
      }
      console.log('the Thread id is :', threadId)
  
      admin
        .messaging()
        .sendToTopic(threadId, payload)
        .then(response => {
          console.log('Successfully sent message:', response)
        })
        .catch(error => {
          console.log('Error sending group message:', error)
        })
    }
    return null
    
  })
  //////////////// group message notification /////////////////
  // exports.sendGroupNotification = functions.firestore
  // .document('groupMessages/{groupId1}/{groupId2}/{message}')
  // .onCreate((snap, context) => {
  //   console.log('----------------start group function--------------------')
  //   const doc = snap.data()
  //   console.log('ggggggggg');
  //   console.log(doc)
  //   const idFrom = doc.idFrom
  //   const contentMessage = doc.content
  //   const groupId = doc.groupId
  //   // Get push token user to (receive)
  //   const payload = {
  //     notification: {
  //       title: `You have a message from "${idFrom}"`,
  //       body: contentMessage,
  //       badge: '1',
  //       sound: 'default'
  //     },
  //     // data: data 
  //   }
  //   admin
  //     .messaging()
  //     .sendToTopic(groupId, payload)
  //     .then(response => {
  //       console.log('Successfully sent message:', response)
  //     })
  //     .catch(error => {
  //       console.log('Error sending group message:', error)
  //     })
      
  //   return null
  // })